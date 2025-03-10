import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationSummaryMemory
import sqlite3

# Load environment variables
load_dotenv()

# Initialize Flask & WebSockets
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize OpenAI API Key
openai_api_key = os.getenv("OPENAI_API_KEY")
ai_model = ChatOpenAI(
    model_name="gpt-4",
    temperature=0.7,
    openai_api_key=openai_api_key
)

# Memory Management
memory = ConversationSummaryMemory(llm=ai_model, memory_key="chat_history")

# Database Connection
def init_db():
    conn = sqlite3.connect("chat_history.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            user_message TEXT,
            ai_response TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

def store_chat(session_id, user_message, ai_response):
    conn = sqlite3.connect("chat_history.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO chat (session_id, user_message, ai_response) VALUES (?, ?, ?)",
        (session_id, user_message, ai_response)
    )
    conn.commit()
    conn.close()

@socketio.on("generate_sequence")
def handle_generate_sequence(data):
    try:
        session_id = "default"
        user_input = data.get("input", "")
        print(f"Received user input: {user_input}")

        # Construct AI prompt
        prompt = f"""Based on the following recruitment requirements: {user_input}

        Please generate a recruiting outreach sequence with multiple followup emails. Include:

        For each email:
        1. Subject line
        2. Professional greeting
        3. Clear message body
        4. Specific call to action
        5. Professional closing

        Format each email with clear spacing and separators between messages.
        The emails should maintain a professional tone while being engaging and personalized.
        Include all key information like salary, location, and role requirements where appropriate."""
        
        # Generate response
        response = ai_model.predict(prompt)
        print(f"Generated AI Sequence:\n{response}")

        # Store in DB
        store_chat(session_id, user_input, response)
        
        # Send the text response to frontend
        socketio.emit("update_workspace", response)
        print("✅ Sent sequence to frontend via WebSocket")
        return {"status": "success"}
        
    except Exception as e:
        print(f"Error generating sequence: {str(e)}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000)