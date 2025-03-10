import os
from langchain.chat_models import ChatOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI model
openai_api_key = os.getenv("OPENAI_API_KEY")
ai_model = ChatOpenAI(model_name="gpt-4", temperature=0.7, openai_api_key=openai_api_key)

# Test OpenAI API call
def test_openai():
    try:
        response = ai_model.predict("Write a short recruiting outreach message.")
        print("✅ AI Response:", response)
    except Exception as e:
        print("❌ OpenAI API Error:", e)

test_openai()
