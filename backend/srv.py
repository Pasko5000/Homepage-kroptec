from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from os import getenv
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

OPENAI_API_KEY = getenv("OPENAI_API_KEY")

def load_instructions_from_file(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()

instructions = load_instructions_from_file("context.txt")

@app.route('/ask', methods=['POST'])
def ask_openai():
    data = request.get_json()
    user_prompt = data.get('prompt', '')
    if not user_prompt:
        return jsonify({'error': 'No prompt provided.'}), 400

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        },
        json={
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": instructions},
                {"role": "user", "content": user_prompt}
            ]
        }
    )

    if response.status_code == 200:
        content = response.json()
        return jsonify(content)
    else:
        return jsonify({'error': 'Failed to fetch response from OpenAI.'}), response.status_code

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
