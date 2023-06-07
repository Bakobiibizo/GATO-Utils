import os
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    AIMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain.schema import (
    AIMessage,
    HumanMessage,
    SystemMessage
)
from dotenv import load_dotenv

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
chat = ChatOpenAI(temperature=0)

messages = [
    SystemMessage(content="You are a friendly and helpful chatbot"),
    HumanMessage(content="Hi there, how are you?")
    ]
response = chat(messages)

print(response)