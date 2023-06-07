import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.langchain.openai_messages import Messages
from services.langchain.openai_chat import OpenAIChatBot
from services.langchain.anthropic_chat import AnthropicChatBot
from flask import Flask, render_template, request, jsonify


app = Flask(__name__)

@app.route('/')
def route_index():
    return render_template('index.html')

@app.route('/api', methods=['GET'])
def api():
    """
    Returns a welcome message and instructions for using the HexLink API.
    Returns:
        str: The welcome message and instructions.
    """
    return """
    Welcome to the HexLink API
    Please make requests in the following format:
    POST /api/chat
    - Expects a JSON payload with the following keys:
    --    model: "The name of the model to use."
    --    content: "A message to send."
    --    role: "The role of the user sending the message."
    POST /api/image
    - Expects a JSON payload with the following keys:
    --    prompt: "The prompt to use."
    --    n: "The number of images to generate."
    --    size: "The size of the images to generate."
    """

@app.route('/api/openai_chat', methods=['POST'])
def route_openai_chat():
    messages = Messages()
    data = request.get_json()
    print(data)
    message = data["payload"]["messages"][1]["content"]
    role = data["payload"]["messages"][0]["role"]
    model = data["payload"]["model"]
    openai = OpenAIChatBot(model=model)
    message = messages.get_message(message=message, role=role)
    response = openai.get_chat_response(messages=message)
    print(f"-- Response: \n{response}")
    return response

if __name__ == '__main__':
    app.run(debug=True)