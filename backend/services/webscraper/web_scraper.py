import os
import sys
sys.path.append(os.path.dirname(os.path.abspath))
from dotenv import load_dotenv
import os
from langchain.document_loaders import UnstructuredURLLoader
from langchain.chains.summarize import load_summarize_chain
from langchain.llms import OpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import PromptTemplate
import pandas as pd

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")

def get_company_page(company_path=None):
    url = input("Enter the URL of the company you're interested in: ")

    print (url)

    loader = UnstructuredURLLoader(urls=[url])
    return loader.load()


# Get the data of the company you're interested in
    company_paths= [
    "https://nextgrid.ai/seed/",
    "https://newnative.ai/",
    "https://lablab.ai/apps/recent-winners"
    ]

docs = get_company_page(company_paths)

print (f"You have {len(data)} document(s)")

print (f"Preview of your data: /n/n{data[0].page_content[900:1150]}")

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size = 800,
    chunk_overlap = 0
)

docs = text_splitter.split_documents(data)

print (f"You now have {len(docs)} documents")

map_prompt = """Below is a section of a website about {prospect}
Your goal is to gather information on the this {prospect} that is hoasting a hackathon. You will collect information you can find about previous winners and what kinds of projects they are looking for.
Please write a concise summary. If it is not related to the {prospect}, exclude it from your summary.
Write your notes down below. You can use the following format:
INFORMATION ABOUT {prospect}:
{text}

CONCISE SUMMARY:""".format(prospect="prospect", text="text")
map_prompt_template = PromptTemplate(template=map_prompt, input_variables=["text", "prospect"])

arr = []

for len(prospects) in range(len(docs)):
    docs[prospects] = map_prompt_template
    arr.append(docs[prospects])
    data = '\n'.join(arr)


combine_prompt = f"""
You have gathered information on these prospects. This is what you have gathered so far:
{data}

Please write a concise recommendation and summary of what the prospective hack a thon runners are looking for in a winner.
YOUR RESPONSE AND THOUGHTS:
"""
combine_prompt_template = PromptTemplate(template=combine_prompt, input_variables=["sales_rep", "company", "prospect", \
                                                                         "text", "company_information"])


llm = OpenAI(temperature=.7, openai_api_key=openai_api_key)

chain = load_summarize_chain(llm,
                             chain_type="map_reduce",
                             map_prompt=map_prompt_template,
                             combine_prompt=combine_prompt_template,
                             verbose=True
                            )

# Save the output to a file
with open ("../docs/output.txt", "a") as f:
    f.write(output['output_text'])


#module for iteration
for i, company in .iterrows():
    print (f"{i + 1}. {company['Name']}")
    page_data = get_company_page(company['Link'])
    docs = text_splitter.split_documents(page_data)
    output = chain({"input_documents": docs, \
                "company":"RapidRoad", \
                "sales_rep" : "Greg", \
                "prospect" : company['Name'],

               })
    print (output['output_text'])
    print ("\n\n")