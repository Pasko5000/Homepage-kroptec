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
qa_pipeline = pipeline("question-answering", model=model, tokenizer=tokenizer)

def load_context_from_file(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()

@app.route('/ask', methods=['POST'])
def answer_question():
    question = request.args.get('prompt', '')
    if not question:
        return jsonify({'error': 'Please provide a question.'}), 400

    # Load context from the context.txt file
    context = load_context_from_file('context.txt')

    # Use the model to generate an answer
    answer = qa_pipeline(question=question, context=context)
    return jsonify(answer)

if __name__ == '__main__':
    app.run(port=8080, debug=True)