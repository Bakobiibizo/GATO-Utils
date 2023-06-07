from __future__ import print_function

import os.path
import base64
import sys

import google.auth
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from email.message import EmailMessage

draft_email = None
for i, arg in enumerate(sys.argv):
    if arg == "--draft_email":
        if i+1 <len(sys.argv):
            draft_email=sys.argv[i+1]
        else:
            print("Error: --draft_email requires an argument")
            sys.exit(1)

if draft_email is None:
    print("Error: --draft_email is required")
    sys.exit(1)
else:
    print("Draft email: " + draft_email)

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.compose']


def main():
    """Shows basic usage of the Gmail API.
    Lists the user's Gmail labels.
    """



def gmail_create_draft():
    """Create and insert a draft email.
       Print the returned draft's message and id.
       Returns: Draft object, including draft id and message meta data.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('../creds/token.json'):
        creds = Credentials.from_authorized_user_file('../creds/token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                '../creds/client-secret.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('../creds/token.json', 'w') as token:
            token.write(creds.to_json())
    try:
        # create gmail api client
        service = build('gmail', 'v1', credentials=creds)

        message = EmailMessage()

        message.set_content(draft_email)

        message['To'] = 'craig@bakobi.com'
        message['From'] = 'richard@bakobi.com'
        message['Subject'] = 'Automated draft'

        # encoded message
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

        create_message = {
            'message': {
                'raw': encoded_message
            }
        }
        # pylint: disable=E1101
        draft = service.users().drafts().create(userId="me",
                                                body=create_message).execute()

        print(F'Draft id: {draft["id"]}\nDraft message: {draft["message"]}')

    except HttpError as error:
        print(F'An error occurred: {error}')
        draft = None

    return draft


if __name__ == '__main__':
    gmail_create_draft()