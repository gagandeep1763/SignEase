import os
import cv2
import mediapipe as mp

# Initialize MediaPipe
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

input_base = "D:/DGM/Dhanush/Sign_language/Video_frames_creator/ISL/Dataset_Cropped_small_pics"  # path to original dataset
output_base = "Dataset_with_Landmarks_small_pics"  # where to save annotated frames

# Create output directory if it doesn't exist
os.makedirs(output_base, exist_ok=True)

# Initialize MediaPipe Hands
with mp_hands.Hands(static_image_mode=True, max_num_hands=2, min_detection_confidence=0.5) as hands:
    for letter_folder in os.listdir(input_base):
        letter_path = os.path.join(input_base, letter_folder)
        if not os.path.isdir(letter_path):
            continue

        for word_folder in os.listdir(letter_path):
            word_path = os.path.join(letter_path, word_folder)
            if not os.path.isdir(word_path):
                continue

            output_word_path = os.path.join(output_base, letter_folder, word_folder)
            os.makedirs(output_word_path, exist_ok=True)

            for frame_file in os.listdir(word_path):
                if not frame_file.lower().endswith((".jpg", ".png", ".jpeg")):
                    continue

                frame_path = os.path.join(word_path, frame_file)
                image = cv2.imread(frame_path)

                if image is None:
                    continue

                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                results = hands.process(image_rgb)

                if results.multi_hand_landmarks:
                    for hand_landmarks in results.multi_hand_landmarks:
                        mp_drawing.draw_landmarks(
                            image, hand_landmarks, mp_hands.HAND_CONNECTIONS,
                            mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=3),
                            mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2)
                        )

                output_frame_path = os.path.join(output_word_path, frame_file)
                cv2.imwrite(output_frame_path, image)
