from flask import Flask, request, jsonify, session
from flask_cors import CORS
import requests
from os import getenv
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__)
app.secret_key = getenv("FLASK_SECRET_KEY")
CORS(app)

OPENAI_API_KEY = getenv("OPENAI_API_KEY")
SPLUNK_HEC_URL = getenv("SPLUNK_HEC_URL")
SPLUNK_HEC_TOKEN = getenv("SPLUNK_HEC_TOKEN")

def load_instructions_from_file(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()

def call_openai(model, messages):
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        },
        json={
            "model": model,
            "messages": messages
        }
    )
    return response

def log_to_splunk(event):
    headers = {
        'Authorization': f'Splunk {SPLUNK_HEC_TOKEN}'
    }
    data = {
        "event": event,
        "sourcetype": "_json"
    }
    response = requests.post(
        SPLUNK_HEC_URL,
        headers=headers,
        data=json.dumps(data)
    )
    return response

@app.route('/ask', methods=['POST'])
def ask_openai():
    data = request.get_json()
    user_prompt = data.get('prompt', '')
    if not user_prompt:
        return jsonify({'error': 'No prompt provided.'}), 400

    session_history = session.get('history', [])
    initial_instructions = load_instructions_from_file("categorize.txt")

    # First query to categorize the prompt
    first_response = call_openai("gpt-3.5-turbo", [
        {"role": "system", "content": initial_instructions},
        *session_history,
        {"role": "user", "content": user_prompt}
    ])

    if first_response.status_code != 200:
        return jsonify({'error': 'Failed to fetch response from OpenAI.'}), first_response.status_code

    category = first_response.json()['choices'][0]['message']['content']

    # Log the first response to Splunk
    log_to_splunk({
        "prompt": user_prompt,
        "response": category,
        "step": "categorization"
    })

    # Loading specific instructions based on the category
    category_instructions = load_instructions_from_file(f"data/{category}.txt")

    # Second query based on the category
    second_response = call_openai("gpt-3.5-turbo-0125", [
        {"role": "system", "content": category_instructions},
        *session_history,
        {"role": "user", "content": user_prompt}
    ])

    if second_response.status_code == 200:
        session['history'] = [*session_history, {"role": "user", "content": user_prompt}]
        content = second_response.json()
        # Log the second response to Splunk
        log_to_splunk({
            "prompt": user_prompt,
            "response": content,
            "step": "detailed_response"
        })
        return jsonify(content)
    else:
        return jsonify({'error': 'Failed to fetch detailed response from OpenAI.'}), second_response.status_code

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
