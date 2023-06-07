import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.langchain.openai_messages import Messages
from services.context_window import ContextWindow


def test_openai_messages():
    context_window = ContextWindow()
    message = Messages()
    system_message = "You are a friendly and helpful chatbot. You provide verbose and detailed answers to queries. If you do not know the answer to something you simply say 'I dont know.'"
    human_message = "hi"
    assistant_message = "Hi there! How can I help you?"
    message.get_message(message=system_message, role="system")
    message.get_message(message=human_message, role="user")
    context = message.get_message(message=assistant_message, role="assistant")
    print(context)

if __name__ == "__main__":
    test_openai_messages()