# SignEase Backend

This is the backend server for the SignEase application, handling image-to-text conversion for sign language recognition.

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

1. Make sure you're in the backend directory
2. Run the Flask application:
```bash
python app.py
```

The server will start on http://localhost:5000

## API Endpoints

### POST /predict
- Accepts image files
- Returns prediction and confidence score
- Request format: multipart/form-data with 'image' field
- Response format:
  ```json
  {
    "prediction": "predicted_gesture",
    "confidence": confidence_score
  }
  ```

## Note
Currently, the prediction endpoint returns dummy data. You'll need to:
1. Add your trained model
2. Update the prediction logic in app.py
3. Configure the model path in app.py 