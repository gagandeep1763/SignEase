# Indian Sign Language (ISL) Lexicon

This directory contains the Indian Sign Language (ISL) lexicon for use with the spoken-to-signed translation system.

## Structure

```
ISL_lexicon/
├── index.csv           # Main mapping file
├── README.md          # This documentation
└── ins/               # Directory for ISL pose files ('ins' is the ISO code for Indian Sign Language)
    ├── hello.pose     # Individual pose files for each sign
    ├── namaste.pose
    └── thank_you.pose
```

## Index File Format

The `index.csv` file contains the following columns:
- `path`: Relative path to the pose file
- `spoken_language`: Language code for the spoken language (en=English, hi=Hindi)
- `signed_language`: Language code for sign language (ins=Indian Sign Language)
- `start`: Start time in the pose sequence
- `end`: End time in the pose sequence
- `words`: The word(s) in the spoken language
- `glosses`: The gloss representation of the sign
- `priority`: Priority level for the sign (0 is default)

## Adding New Signs

To add a new sign:
1. Create a video recording of the sign
2. Convert the video to pose format using video_to_pose tool
3. Add the pose file to the ins/ directory
4. Add an entry to index.csv

## Supported Languages

Currently supports:
- English (en) → ISL (ins)
- Hindi (hi) → ISL (ins) 
