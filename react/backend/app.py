from flask import Flask, request, render_template_string, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import joblib
import mediapipe as mp
import base64
import os
import logging
import io
from PIL import Image
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Enabling CORS for all routes
CORS(app, resources={
    r"/*": {
        "origins": [os.getenv('FRONTEND_URL', 'http://localhost:3000')],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept", "Authorization"],
        "max_age": 3600
    }
})

# Loading model and encoder
MODEL_PATH = os.path.join('isl_gif', 'image2sign', 'gesture_model.pkl')
LABEL_ENCODER_PATH = os.path.join('isl_gif', 'labels.json')

try:
    model = joblib.load(MODEL_PATH)
    # Loading labels from JSON instead of using label encoder
    with open(LABEL_ENCODER_PATH, 'r') as f:
        import json
        labels_dict = json.load(f)
    logger.info("Model and labels loaded successfully")
except Exception as e:
    logger.error(f"Error loading model or labels: {e}")
    model = None
    labels_dict = None

# Setup MediaPipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1, min_detection_confidence=0.5)

@app.route('/test', methods=['GET'])
def test():
    """Test endpoint to verify server is running"""
    return jsonify({'status': 'Backend server is running!'})

@app.route('/predict', methods=['POST'])
def predict():
    """Endpoint to predict gesture from uploaded image"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if not file.filename:
            return jsonify({'error': 'No file selected'}), 400

        # Read image file
        file_bytes = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({'error': 'Invalid image file'}), 400

        # Process image with MediaPipe
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb)

        if not result.multi_hand_landmarks:
            return jsonify({'error': 'No hand detected in the image'}), 400

        # Extract hand landmarks
        lm = result.multi_hand_landmarks[0]
        features = [coord for point in lm.landmark for coord in (point.x, point.y, point.z)]
        features = np.array(features).reshape(1, -1)

        # Make prediction
        if model is not None and labels_dict is not None:
            pred_index = model.predict(features)[0]
            prediction = labels_dict.get(str(pred_index), "Unknown gesture")
            confidence = float(np.max(model.predict_proba(features)[0]))

            return jsonify({
                'prediction': prediction,
                'confidence': confidence
            })
        else:
            return jsonify({'error': 'Model not loaded'}), 500

    except Exception as e:
        logger.error(f"Error processing image: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    try:
        # Run the Flask app
        port = int(os.getenv('PORT', 5000))
        app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_ENV') == 'development')
    finally:
        pass 