document.addEventListener("DOMContentLoaded", function () {
    const inputMethodRadios = document.querySelectorAll('input[name="input-method"]');
    const textInput = document.getElementById("text-input");
    const fileInput = document.getElementById("file-input");
    const urlInput = document.getElementById("url-input");

    inputMethodRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            if (radio.value === "paste") {
                textInput.style.display = "block";
                fileInput.style.display = "none";
                urlInput.style.display = "none";
                textInput.value = ''; // Clear previous input
            } else if (radio.value === "upload") {
                textInput.style.display = "none";
                fileInput.style.display = "block";
                urlInput.style.display = "none";
            } else if (radio.value === "url") {
                textInput.style.display = "none";
                fileInput.style.display = "none";
                urlInput.style.display = "block";
                urlInput.value = ''; // Clear previous input
            }
        });
    });

    document.getElementById("generate-summary").addEventListener("click", function () {
        const summaryType = document.querySelector('input[name="summary-type"]:checked').value;
        let inputText = "";

        if (document.querySelector('input[name="input-method"]:checked').value === "paste") {
            inputText = textInput.value;
            generateSummary(inputText, summaryType);
        } else if (document.querySelector('input[name="input-method"]:checked').value === "upload") {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                inputText = e.target.result;
                generateSummary(inputText, summaryType);
            };
            if (file) {
                reader.readAsText(file);
            }
            return; // Prevent further execution until file is read
        } else if (document.querySelector('input[name="input-method"]:checked').value === "url") {
            inputText = urlInput.value;
            fetchTextFromURL(inputText, summaryType);
        }
    });

    function fetchTextFromURL(url, summaryType) {
        fetch('/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: url, summary_type: summaryType }) // Ensure summary_type is included
        })
        .then(response => response.json())
        .then(data => {
            if (data.summary) {
                document.getElementById("summary-output").value = data.summary;
            } else {
                document.getElementById("summary-output").value = 'Error fetching summary.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById("summary-output").value = 'Error fetching summary.';
        });
    }

    function generateSummary(text, type) {
        // Call your summarization API here
        fetch('/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text, summary_type: type }) // Include both text and summary type
        })
        .then(response => response.json())
        .then(data => {
            if (data.summary) {
                document.getElementById("summary-output").value = data.summary;
            } else {
                document.getElementById("summary-output").value = 'Error generating summary.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById("summary-output").value = 'Error generating summary.';
        });
    }

    document.getElementById("download-summary").addEventListener("click", function () {
        const summaryText = document.getElementById("summary-output").value;
        const blob = new Blob([summaryText], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "summary.txt";
        link.click();
    });
});
