import os
import cv2
import mediapipe as mp
from tqdm import tqdm

# Set your dataset directory here
input_dir = r"D:/DGM/Dhanush/Sign_language/Video_frames_creator/ISL/Dataset"
output_dir = input_dir + "_Cropped_Updated"

# Create output folder if not exist
os.makedirs(output_dir, exist_ok=True)

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=2)
mp_drawing = mp.solutions.drawing_utils

min_crop_size = 50  # Minimum hand box size to save

def crop_hand_from_image(img, landmarks, img_w, img_h):
    x_coords = [int(lm.x * img_w) for lm in landmarks]
    y_coords = [int(lm.y * img_h) for lm in landmarks]
    x_min, x_max = min(x_coords), max(x_coords)
    y_min, y_max = min(y_coords), max(y_coords)

    # Add padding
    pad = 20
    x_min = max(x_min - pad, 0)
    y_min = max(y_min - pad, 0)
    x_max = min(x_max + pad, img_w)
    y_max = min(y_max + pad, img_h)

    if (x_max - x_min) < min_crop_size or (y_max - y_min) < min_crop_size:
        return None  # Skip small crops
    return img[y_min:y_max, x_min:x_max]

def process_image(image_path, save_path_base):
    img = cv2.imread(image_path)
    if img is None:
        return

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = hands.process(img_rgb)

    if results.multi_hand_landmarks:
        for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
            crop = crop_hand_from_image(img, hand_landmarks.landmark, img.shape[1], img.shape[0])
            if crop is not None:
                save_path = f"{save_path_base}_hand{idx+1}.jpg"
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                cv2.imwrite(save_path, crop)

def process_dataset(input_root, output_root):
    for letter in sorted(os.listdir(input_root)):
        letter_path = os.path.join(input_root, letter)
        if not os.path.isdir(letter_path):
            continue

        print(f"Processing {letter}:")
        for word in tqdm(os.listdir(letter_path), desc=f"  Word folders in {letter}"):
            word_path = os.path.join(letter_path, word)
            if not os.path.isdir(word_path):
                continue

            for frame in os.listdir(word_path):
                if not frame.lower().endswith((".jpg", ".png")):
                    continue

                img_path = os.path.join(word_path, frame)
                relative_path = os.path.relpath(img_path, input_root)
                save_path_base = os.path.join(output_root, os.path.splitext(relative_path)[0])
                process_image(img_path, save_path_base)

process_dataset(input_dir, output_dir)

print("\n✅ Hand cropping complete! Check:", output_dir)
