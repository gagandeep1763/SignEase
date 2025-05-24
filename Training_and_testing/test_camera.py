import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import mediapipe as mp
import os

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)
mp_drawing = mp.solutions.drawing_utils

# Load the best model
model = load_model('best_model.keras')

# Get class names
data_dir = "D:/DGM/Dhanush/Sign_language/Video_frames_creator/ISL/Dataset_with_Landmarks"
class_names = sorted([d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))])

# Initialize video capture
cap = cv2.VideoCapture(0)

# Parameters
sequence_length = 10
img_size = (128, 128)
frame_buffer = []
min_confidence = 0.7  # Minimum confidence threshold for prediction

def preprocess_frame(frame):
    # Convert to RGB for MediaPipe
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Process with MediaPipe
    results = hands.process(frame_rgb)
    
    if results.multi_hand_landmarks:
        # Get hand landmarks
        for hand_landmarks in results.multi_hand_landmarks:
            # Draw landmarks
            mp_drawing.draw_landmarks(
                frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            
            # Get bounding box
            h, w, _ = frame.shape
            x_coords = [int(lm.x * w) for lm in hand_landmarks.landmark]
            y_coords = [int(lm.y * h) for lm in hand_landmarks.landmark]
            x_min, x_max = min(x_coords), max(x_coords)
            y_min, y_max = min(y_coords), max(y_coords)
            
            # Add padding
            pad = 20
            x_min = max(x_min - pad, 0)
            y_min = max(y_min - pad, 0)
            x_max = min(x_max + pad, w)
            y_max = min(y_max + pad, h)
            
            # Crop and resize
            hand_crop = frame[y_min:y_max, x_min:x_max]
            if hand_crop.size > 0:  # Check if crop is valid
                hand_crop = cv2.resize(hand_crop, img_size)
                return hand_crop
    
    return None

print("Starting camera feed...")
print("Press 'q' to quit")

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # Mirror the frame horizontally
    frame = cv2.flip(frame, 1)
    
    # Preprocess frame
    processed_frame = preprocess_frame(frame)
    
    if processed_frame is not None:
        # Add to frame buffer
        frame_buffer.append(processed_frame)
        
        # Keep only the last sequence_length frames
        if len(frame_buffer) > sequence_length:
            frame_buffer.pop(0)
        
        # Make prediction when we have enough frames
        if len(frame_buffer) == sequence_length:
            # Prepare input
            input_sequence = np.array([frame_buffer])
            input_sequence = input_sequence / 255.0  # Normalize
            
            # Get prediction
            predictions = model.predict(input_sequence, verbose=0)
            predicted_class = np.argmax(predictions[0])
            confidence = predictions[0][predicted_class]
            
            # Display prediction if confidence is high enough
            if confidence > min_confidence:
                predicted_letter = class_names[predicted_class]
                cv2.putText(frame, f"Letter: {predicted_letter}", (10, 30),
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                cv2.putText(frame, f"Confidence: {confidence:.2f}", (10, 70),
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    
    # Display the frame
    cv2.imshow('ISL Recognition', frame)
    
    # Break loop on 'q' press
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Clean up
cap.release()
cv2.destroyAllWindows() 