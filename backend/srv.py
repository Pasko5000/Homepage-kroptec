from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

app = Flask(__name__)
CORS(app)

# Load summarization pipeline with mBART
summarization_pipeline = pipeline("summarization", model="facebook/mbart-large-cc25")

@app.route('/summarize', methods=['POST'])
def summarize_text():
    # Retrieve data from the JSON request body
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided for summarization.'}), 400

    # Generate summary using the mBART model
    summary = summarization_pipeline(text)
    return jsonify({'summary': summary})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
