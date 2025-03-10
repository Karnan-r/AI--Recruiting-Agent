from flask import Blueprint, request, jsonify

api_bp = Blueprint('api', __name__)

@api_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    print("Received data:", data)  # Log the input for debugging
    # For now, simply return a dummy response
    response = {
        "message": "This is a placeholder response. Process your input to generate sequence."
    }
    return jsonify(response), 200
