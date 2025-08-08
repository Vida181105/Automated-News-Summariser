from flask import Flask, request, jsonify, render_template
import requests
from bs4 import BeautifulSoup
import nltk
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import networkx as nx
from transformers import pipeline

app = Flask(__name__)

# Set the NLTK data path to your local directory
nltk_data_path = os.path.join(os.path.dirname(__file__), 'nltk_data')
nltk.data.path.append(nltk_data_path)

# Ensure that necessary NLTK data files are available
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Initialize the abstractive summarizer
summarizer = pipeline('summarization', model='t5-small')  # or use 'facebook/bart-large-cnn'

def preprocess_text(text):
    # Tokenize sentences
    sentences = nltk.sent_tokenize(text)
    # Remove stopwords and special characters
    stop_words = set(nltk.corpus.stopwords.words('english'))
    processed_sentences = [
        ' '.join([word for word in sentence.lower().split() if word.isalnum() and word not in stop_words])
        for sentence in sentences
    ]
    return sentences, processed_sentences

def textrank(sentences, similarity_matrix, top_n=3):
    # Build graph with sentences as nodes and similarities as edges
    graph = nx.from_numpy_array(similarity_matrix)
    # Apply PageRank to rank sentences
    scores = nx.pagerank(graph)
    ranked_sentences = sorted(((scores[i], s) for i, s in enumerate(sentences)), reverse=True)
    # Select top-ranked sentences for summary
    summary = ' '.join([sent for score, sent in ranked_sentences[:top_n]])
    return summary

def extractive_summarization(input_text):
    # Preprocess text
    sentences, processed_sentences = preprocess_text(input_text)

    # Convert sentences to TF-IDF vectors
    vectorizer = TfidfVectorizer()
    sentence_vectors = vectorizer.fit_transform(processed_sentences)

    # Compute cosine similarity matrix
    similarity_matrix = cosine_similarity(sentence_vectors)

    # Generate extractive summary
    summary = textrank(sentences, similarity_matrix)
    return summary

def abstractive_summarization(input_text):
    # Generate abstractive summary
    summary = summarizer(input_text, max_length=500, min_length=80, do_sample=False)[0]['summary_text']
    return summary

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.json
    input_text = data.get('text')
    summary_type = data.get('summary_type')

    # Check if input_text is a URL
    if input_text.startswith('http'):
        # Fetch article text if it's a URL
        response = requests.get(input_text)
        soup = BeautifulSoup(response.text, 'html.parser')
        input_text = ' '.join([p.text for p in soup.find_all('p')])

    if summary_type == 'extractive':
        summary = extractive_summarization(input_text)
    elif summary_type == 'abstractive':
        summary = abstractive_summarization(input_text)
    else:
        return jsonify({"error": "Invalid summary type."}), 400

    return jsonify({"summary": summary})

if __name__ == '__main__':
    app.run(debug=True)