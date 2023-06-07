from langchain.schema import (
    AIMessage,
    HumanMessage,
    SystemMessage
)
from services.context_window import ContextWindow

class Messages():
    def __init__(self):
        self.context_window = ContextWindow()
        self.context = self.context_window.context


    def get_message(self, role, message):
        if not message:
            return "Please provide a message"
        if not role:
            return "Please provide a role"
        try:
            if role == "user":
                message = HumanMessage(content=message)
            if role == "assistant":
                message = AIMessage(content=message)
            if role == "system":
                message =SystemMessage(content=message)
            self.context_window.add_message(message=message)

            return self.context
        except Exception as e:
            print(e)
            return "Error generating message"

#    def get_prompt_templates(self, message=None, input_variables=None, role="user"):
#        template = message
#        input_variables = input_variables
#        if not input_variables:
#            return "Please provide input variables"
#        if not template:
#            return "Please provide a template with input variables in {}"
#        try:
#            if role == "user":
#                return HumanMessagePromptTemplate.from_template(template=template, template_format="f-string", input_variables=input_variables)
#            if role == "ai":
#                return AIMessagePromptTemplate.from_template(template=template, template_format="f-string", input_variables=input_variables)
#            if role == "system":
#                return SystemMessagePromptTemplate.from_template(template=template, template_format="f-string", input_variables=input_variables)
#        except Exception as e:
#            print(e)
#            return "Error generating prompt template"
#
#
#    def get_chat_prompt_template(self, messages=None):
#        try:
#            return ChatPromptTemplate.from_messages(messages=messages)
#        except Exception as e:
#            print(e)
#            return "Error generating chat template"

if __name__ == "__main__":
    Messages()
