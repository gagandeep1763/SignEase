# Indian Sign Language (ISL) Recognition

This project implements real-time Indian Sign Language recognition using deep learning and computer vision.

## Features
- Real-time hand detection and tracking
- Sequence-based sign language recognition
- Support for multiple sign language gestures
- Real-time visualization with confidence scores

## Setup Instructions

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Model Files:
   - The trained model files are not included in this repository
   - Contact the team members to get the model files
   - Place the model files in the project root directory:
     - `best_model.keras` (for testing)
     - `isl_sign_model_final.keras` (final model)

3. Run the camera test:
```bash
python test_camera.py
```

## Project Structure
```
ISL/
├── train_model.py          # Training script
├── test_camera.py         # Real-time testing script
├── requirements.txt       # Project dependencies
└── README.md             # This file
```

## Model Sharing
For security reasons, the trained models are not included in this repository. To get the model files:
1. Contact the team members
2. Models will be shared via secure channels (WhatsApp/Email)
3. Place the received model files in the project root directory

## Usage
1. Run the camera test script
2. Show your hand to the camera
3. Make the sign language gesture
4. Hold it steady for a moment
5. The prediction will appear on screen
6. Press 'q' to quit

## Tips for Better Results
- Ensure good lighting
- Keep your hand within the camera frame
- Make clear, distinct gestures
- Hold the gesture steady for a moment
- Try to match the hand position from training data

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.