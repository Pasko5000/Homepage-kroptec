from flask import Flask, request, jsonify
from flask_cors import CORS

# Load model directly
from transformers import pipeline
# Load model directly
from transformers import AutoTokenizer, AutoModelForQuestionAnswering

tokenizer = AutoTokenizer.from_pretrained("henryk/bert-base-multilingual-cased-finetuned-polish-squad1")
model = AutoModelForQuestionAnswering.from_pretrained("henryk/bert-base-multilingual-cased-finetuned-polish-squad1")

app = Flask(__name__)
CORS(app)

# Create a question-answering pipeline
qa_pipeline = pipeline("question-answering", model=model, tokenizer=tokenizer, top_k=3, max_answer_length=150)

def load_context_from_file(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()

@app.route('/ask', methods=['POST'])
def answer_question():
    # Pobieranie danych z ciała żądania JSON
    data = request.get_json()
    question = data.get('prompt', '')
    
    if not question:
        return jsonify({'error': 'Please provide a question.'}), 400

    # Załadowanie kontekstu z pliku
    context = load_context_from_file('context.txt')

    # Użycie modelu do generowania odpowiedzi
    answer = qa_pipeline(question=question, context=context)
    return jsonify(answer)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
