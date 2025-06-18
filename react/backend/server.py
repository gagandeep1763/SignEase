import base64
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
import joblib
import cv2
import mediapipe as mp
from googletrans import Translator

app = Flask(__name__)
CORS(app)

# Load model and scaler
model = joblib.load("D:/DGM/Dhanush/Major_Project/Completed_final_project/SignEase/react/backend/gesture_model.pkl")
scaler = joblib.load("D:/DGM/Dhanush/Major_Project/Completed_final_project/SignEase/react/backend/gesture_scaler.pkl")

# Initialize MediaPipe
mp_hands = mp.solutions.hands.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.7)

# Translator
translator = Translator()

@app.route("/api/detect", methods=["POST"])
def detect():
    try:
        data = request.json
        img_data = data['image'].split(',')[1]  
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


@app.route("/api/translate", methods=["POST"])
def translate():
    try:
        data = request.json
        text = data['text']
        target_lang = data['targetLang']

        translated = translator.translate(text, dest=target_lang)
        return jsonify({ "translatedText": translated.text })

    except Exception as e:
        return jsonify({ "error": str(e) })


if __name__ == "__main__":
    app.run(debug=True)
