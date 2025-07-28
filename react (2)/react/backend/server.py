import base64
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
import joblib
import cv2
import mediapipe as mp
import os
import openai

app = Flask(__name__)
CORS(app)

# Load model and scaler
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "gesture_model.pkl")
scaler_path = os.path.join(BASE_DIR, "gesture_scaler.pkl")
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found: {model_path}")
if not os.path.exists(scaler_path):
    raise FileNotFoundError(f"Scaler file not found: {scaler_path}")
model = joblib.load(model_path)
scaler = joblib.load(scaler_path)

# Initialize MediaPipe
mp_hands = mp.solutions.hands.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.7)


@app.route("/api/detect", methods=["POST"])
def detect():
    try:
        data = request.json
        img_data = data['image'].split(',')[1]  # Remove header like "data:image/jpeg;base64,..."
        img = Image.open(io.BytesIO(base64.b64decode(img_data)))
        frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

        result = mp_hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:
                landmarks = [coord for lm in hand_landmarks.landmark for coord in (lm.x, lm.y, lm.z)]

                if len(landmarks) == 63:
                    scaled = scaler.transform([landmarks])
                    prediction = model.predict(scaled)[0]
                    return jsonify({ "detectedText": prediction })

        return jsonify({ "detectedText": "No hand detected" })

    except Exception as e:
        return jsonify({ "error": str(e) })


@app.route("/api/correct", methods=["POST"])
def correct():
    try:
        data = request.json
        sentence = data['sentence']
        prompt = f"Remove all repeated words or phrases from this sentence, keeping only the first occurrence of each, and correct the sentence: {sentence}"
        openai.api_key = os.environ.get('OPENAI_API_KEY')
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100
        )
        corrected = response['choices'][0]['message']['content'].strip()
        return jsonify({'corrected': corrected})
    except Exception as e:
        return jsonify({'error': str(e)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
