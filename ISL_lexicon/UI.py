import tkinter as tk
from tkinter import messagebox
import pandas as pd
import os
import cv2

# Paths
CSV_PATH = os.path.join("ISL_lexicon", "index.csv")
VIDEO_FOLDER = os.path.join("ISL_lexicon", "Videos", "output")

# Define stop words to ignore
STOP_WORDS = {
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
    'the', 'a', 'an',
    'to', 'of', 'for', 'in', 'on', 'at', 'by', 'with',
    'and', 'or', 'but',
    'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'this', 'that', 'these', 'those',
    'do', 'does', 'did',
    'have', 'has', 'had',
    'will', 'would', 'shall', 'should',
    'can', 'could', 'may', 'might',
    'must', 'ought'
}

# Load CSV once
df = pd.read_csv(CSV_PATH)
word_to_video = {row['words']: row['path'] for _, row in df.iterrows()}

def play_video(video_path):
    """Play a video using OpenCV."""
    full_path = os.path.join(VIDEO_FOLDER, os.path.basename(video_path))
    if not os.path.exists(full_path):
        messagebox.showerror("Error", f"Video not found: {full_path}")
        return
    
    cap = cv2.VideoCapture(full_path)
    if not cap.isOpened():
        messagebox.showerror("Error", f"Could not open video: {full_path}")
        return
        
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        cv2.imshow("Sign Output", frame)
        if cv2.waitKey(25) & 0xFF == ord('q'): break
    cap.release()
    cv2.destroyAllWindows()

def process_input():
    input_text = entry.get().strip().lower()
    if not input_text:
        messagebox.showwarning("Warning", "Please enter some English words.")
        return

    # Split text and remove stop words
    words = [word for word in input_text.split() if word.lower() not in STOP_WORDS]
    
    if not words:
        messagebox.showwarning("Warning", "No meaningful words found after removing stop words.")
        return

    matched = False
    print(f"Processing words: {words}")  # Debug print

    for word in words:
        if word in word_to_video:
            matched = True
            print(f"Playing video for word: {word} -> {word_to_video[word]}")  # Debug print
            play_video(word_to_video[word])
        else:
            # Try common variations (e.g., plural forms)
            variations = [
                word,
                word + 's' if not word.endswith('s') else word[:-1],  # Try plural/singular
                word + "'s",  # Try possessive form
            ]
            variation_found = False
            for var in variations:
                if var in word_to_video:
                    matched = True
                    variation_found = True
                    print(f"Playing video for variation: {var} -> {word_to_video[var]}")  # Debug print
                    play_video(word_to_video[var])
                    break
            
            if not variation_found:
                messagebox.showinfo("Not Found", f"No sign available for: {word}")

    if not matched:
        messagebox.showinfo("Info", "No matching signs found in dataset.")

# --- UI Setup ---
root = tk.Tk()
root.title("ISL Translator")
root.geometry("400x200")
root.configure(bg="black")

label = tk.Label(root, text="Enter English Text:", fg="white", bg="black", font=("Arial", 14))
label.pack(pady=10)

entry = tk.Entry(root, width=40, font=("Arial", 12))
entry.pack(pady=5)

btn = tk.Button(root, text="Translate to ISL", command=process_input, font=("Arial", 12), bg="#00bfff", fg="white")
btn.pack(pady=20)

# Add help text
help_text = """
Tips:
- Common words like 'is', 'am', 'the', etc. are ignored
- Try both singular and plural forms if a word isn't found
- Press 'q' to close video windows
"""
help_label = tk.Label(root, text=help_text, fg="gray", bg="black", font=("Arial", 10), justify=tk.LEFT)
help_label.pack(pady=5)

root.mainloop()