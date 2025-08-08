# Automated News Summarizer

This project is a web-based application that summarizes news articles using both **extractive** and **abstractive** summarization techniques. Built using Flask and NLP tools, it allows users to input or upload article content and receive concise summaries using either TextRank or a Transformer-based T5 model.

---

## Features

- **Extractive Summarization** using TextRank with TF-IDF scoring
- **Abstractive Summarization** using T5 Transformer from Hugging Face
- Web Interface: Flask-powered frontend with clean HTML/CSS/JS
- Input via file upload or direct text box

---

## Techniques Used

### 1. Extractive Summarization (Unsupervised)
- Sentence tokenization using `nltk` and `punkt`
- Sentence vectors built using TF-IDF
- Cosine similarity matrix construction
- Graph creation via `networkx`
- PageRank algorithm to score and rank sentences
- Top N sentences selected for summary

### 2. Abstractive Summarization (Pretrained)
- Preprocessing and truncation of large input text
- T5-base transformer model for text generation
- Beam search decoding for summary generation
- `transformers` library for model loading

---

## Project Structure

```
automated-news-summarizer/
├── app.py                    # Flask server
├── templates/
│   └── index.html            # UI for summarization
├── static/
│   ├── styles.css            # CSS styling
│   └── script.js             # Frontend JS
├── requirements.txt
├── LICENSE
└── README.md
```

---

## How to Run

1. Clone the repo
2. Install dependencies:
```bash
pip install -r requirements.txt
```
3. Download necessary NLTK corpora:
```python
import nltk
nltk.download('punkt')
nltk.download('stopwords')
```
4. Start the app:
```bash
python app.py
```

---

## License

MIT License. See [LICENSE](./LICENSE) for details.
