# ISL Translator UI Setup

## Required Files
1. `UI.py` - The main UI application
2. `index.csv` - Maps English words to their corresponding sign language videos
3. `Videos/output/*.mp4` - The video files for each sign

## Directory Structure
```
ISL_lexicon/
├── UI.py
├── index.csv
└── Videos/
    └── output/
        ├── Jacket.mp4
        ├── Job.mp4
        └── ... (other .mp4 files)
```

## Dependencies
Install the required Python packages:
```bash
pip install pandas opencv-python tkinter
```

## Running the Application
1. Make sure all files are in the correct directory structure
2. Run the UI:
```bash
python UI.py
```

## Usage
1. Enter English text in the input field
2. Click "Translate to ISL" button
3. Videos will play for each recognized word
4. Press 'q' to close video windows

## Features
- Ignores common stop words (is, am, are, the, a, an, etc.)
- Handles word variations (singular/plural/possessive)
- Shows helpful tips in the UI
- Provides feedback for unrecognized words

## Troubleshooting
1. If videos don't play:
   - Check that all .mp4 files are in the Videos/output directory
   - Verify file paths in index.csv are correct
   - Ensure OpenCV is properly installed

2. If words aren't recognized:
   - Check if the word exists in index.csv
   - Try singular/plural forms
   - Remove stop words (is, am, the, etc.) 