import os
from dotenv import load_dotenv

load_dotenv()

class Config(object):
    """
    Configuration for the application.

    Attributes:
        DEBUG (bool): If True, the app will run in debug mode.
        TESTING (bool): If True, the app will run in testing mode.
        OPEN_API_KEY (str): The OpenAI API key.
        MODELS (list): A list of model names.
    """
    DEBUG = False
    TESTING = False
    OPEN_API_KEY = 'api_key'
    #TODO: Add a list of models
    MODELS = ["gpt-4", "gpt-3.5-turbo"]

if __name__ == '__main__':
     Config()