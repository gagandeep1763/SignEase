# SignEase ✋🤟

A full-stack web platform that bridges the communication gap using Indian Sign Language (ISL). SignEase supports **Text-to-Sign**, **Sign-to-Text**, and a **Learn Sign Language** module — all integrated with Google Authentication and a smooth UI.

---

## 🔗 Live Demo
*([View my project](https://sign-ease-dhanush-g-ms-projects.vercel.app/))*

---

## 🚀 Features

### 1. Text to Sign Language (Text-to-Sign)
- Collected ISL videos and extracted human pose keypoints.
- Converted `.pose` files to animated `.mp4` sign videos.
- Covered **1500+ commonly used words** with **all tenses and synonyms**.
- Accepts full sentences or individual words and plays an animated **sign video sequence** accordingly.

### 2. Sign to Text Language (Sign-to-Text)
- Created a custom dataset for **45 commonly used signs**.
- Trained a **Random Forest** model to detect signs via camera.
- Real-time sign recognition through frontend webcam interface.
- Click **"Save"** to append detected signs into a forming sentence.
- Deduplication logic: e.g., `"I love love love you"` → `"I love you"`.
- Translates the final sign sequence into readable text.

### 3. Learn Sign Language
- Visual learning tool for **numbers** and **alphabets** in sign language.
- Click any letter or number to view its animated sign.
- Ideal for beginners looking to learn ISL basics interactively.

---

## 🔐 Authentication
- **Google Login** integrated using Firebase Authentication.
- Secure user flow with Terms & Conditions and session management.

---

## 📁 Tech Stack

| Frontend      | Backend        | ML/AI         | Auth & DB     |
|---------------|----------------|---------------|----------------|
| React.js      | Node.js        | MediaPipe, RF | Firebase       |
| HTML, CSS     | Express.js     | OpenCV        | Firestore DB   |

---

## 📸 Screenshots
*(Add relevant screenshots or screen recordings of your app here.)*

---

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gagandeep1763/SignEase.git
   cd SignEase
2. Install dependencies:
   ```bash
   npm install
3. Run the app locally:
    ```bash
    npm start
4. For ML model training and pose generation:
   Refer to the pose-processing/ and ml-model/ folders for scripts and notebooks.

Contributions: 
Contributions, issues, and feature requests are welcome! Feel free to check the Issues section.

📜 License: 
This project is licensed under the MIT License. See the LICENSE file for details.

🙌 Acknowledgements
Thanks to:

ISL Dictionary Dataset for video resources

Teammates: Dhanush, Aryan, Jayanth

Our Guide: @Nandita Ma'am for her support and mentorship
