import threading
import tkinter as tk
import cv2
import mediapipe as mp
import joblib
import time
from googletrans import Translator
import ttkbootstrap as tb
from ttkbootstrap.constants import *

model_gesture = joblib.load("C:/Users/DELL/Downloads/isl_gif/gesture-recognition/gesture_model.pkl")
scaler = joblib.load("C:/Users/DELL/Downloads/isl_gif/gesture-recognition/gesture_scaler.pkl")

translator = Translator()

gesture_running = False

root = tb.Window(themename="darkly")
root.title("Sign to Text Translator")
root.geometry("800x550")

tb.Label(root, text="Detected Gesture (English):", font=("Segoe UI", 12)).pack()
english_label = tb.Label(root, text="", font=("Segoe UI", 18), bootstyle="warning", anchor="center", wraplength=700, justify="center")
english_label.pack(pady=10)

tb.Label(root, text="Translated Output:", font=("Segoe UI", 12)).pack()
translated_label = tb.Label(root, text="", font=("Segoe UI", 18), bootstyle="info", anchor="center", wraplength=700, justify="center")
translated_label.pack(pady=10)

lang_options = {
    "English": "en",
    "Hindi": "hi",
    "Kannada": "kn",
    "Tamil": "ta",
    "Telugu": "te",
    "Malayalam": "ml"
}
selected_lang_name = tk.StringVar(value="English")

tb.Label(root, text="Select Language:", font=("Segoe UI", 12)).pack()
lang_menu = tb.OptionMenu(root, selected_lang_name, *lang_options.keys())
lang_menu.pack(pady=5)

def translate_text(text):
    try:
        lang_name = selected_lang_name.get()
        if lang_name == "English":
            # Return original text and English lang code as a tuple
            return text, "en"
        lang_code = lang_options[lang_name]
        translated = translator.translate(text, dest=lang_code)
        return translated.text, lang_code
    except Exception as e:
        return f"Translation failed: {e}", "en"

def gesture_to_text():
    global gesture_running
    gesture_running = True
    cap = cv2.VideoCapture(0)
    mp_hands = mp.solutions.hands.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.7)
    last_prediction = None
    cooldown_start = time.time()
    cooldown_period = 2

    while gesture_running:
        ret, frame = cap.read()
        if not ret:
            break
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = mp_hands.process(rgb)

        if result.multi_hand_landmarks:
            found_valid = False
            for hand_landmarks in result.multi_hand_landmarks:
                landmarks = [coord for lm in hand_landmarks.landmark for coord in (lm.x, lm.y, lm.z)]
                if len(landmarks) == 63:
                    found_valid = True
                    scaled = scaler.transform([landmarks])
                    try:
                        prediction = model_gesture.predict(scaled)[0]
                    except:
                        prediction = "Try again"
                    if prediction != last_prediction or (time.time() - cooldown_start) > cooldown_period:
                        last_prediction = prediction
                        cooldown_start = time.time()
                        english_label.config(text=prediction)

                        if prediction == "Try again":
                            translated_label.config(text="Try again")
                        else:
                            result = translate_text(prediction)
                            if result and len(result) == 2:
                                translated_text, lang_code = result
                            else:
                                translated_text, lang_code = prediction, "en"
                            translated_label.config(text=translated_text)
            if not found_valid:
                english_label.config(text="")
                translated_label.config(text="")
        else:
            english_label.config(text="")
            translated_label.config(text="")

        cv2.imshow("Camera - Press Q to Quit", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    gesture_running = False

btn_frame = tb.Frame(root)
btn_frame.pack(pady=20)
start_btn = tb.Button(btn_frame, text="Start Sign Detection", command=lambda: threading.Thread(target=gesture_to_text, daemon=True).start(), bootstyle=SUCCESS)
start_btn.pack()

def on_closing():
    global gesture_running
    gesture_running = False
    root.destroy()

root.protocol("WM_DELETE_WINDOW", on_closing)
root.mainloop()
