import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.langchain.openai_chat import OpenAIChatBot
from langchain.schema import HumanMessage

def test_openai_api():
    chat_bot = OpenAIChatBot()
    messages = [
        HumanMessage(
        content="Hello, how are you?"
        )
    ]
    print(messages)
    response = chat_bot.get_chat_response(messages=messages)
    print(response)

if __name__ == "__main__":
    test_openai_api()