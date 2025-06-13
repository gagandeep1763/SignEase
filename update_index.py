import os
import pandas as pd

# Paths
CSV_PATH = os.path.join("ISL_lexicon", "index.csv")
VIDEO_FOLDER = os.path.join("ISL_lexicon", "Videos", "output")

def standardize_word(word):
    """Standardize word format: lowercase, replace underscores with spaces."""
    return word.lower().replace('_', ' ')

# Get list of all MP4 files in output folder with their exact names
mp4_files = [f for f in os.listdir(VIDEO_FOLDER) if f.endswith('.mp4')]
print(f"Found {len(mp4_files)} MP4 files in output folder")

# Create a mapping of standardized words to their exact filenames
file_mapping = {standardize_word(os.path.splitext(f)[0]): f for f in mp4_files}

# Create new DataFrame with exact filenames
new_df = []
for word, filename in file_mapping.items():
    new_df.append({
        'path': f"Videos/output/{filename}",
        'spoken_language': 'en',
        'signed_language': 'ins',
        'start': 0,
        'end': 0,
        'words': word,
        'glosses': word.upper(),
        'priority': 0
    })

# Convert to DataFrame and sort by words
df = pd.DataFrame(new_df)
df = df.sort_values('words', ignore_index=True)

# Save updated CSV
df.to_csv(CSV_PATH, index=False)
print(f"✅ Updated index.csv with {len(df)} entries")

# Print any missing files
csv_files = set(os.path.basename(path) for path in df['path'])
missing_files = set(mp4_files) - csv_files
if missing_files:
    print("\nWarning: The following files are missing from index.csv:")
    for f in sorted(missing_files):
        print(f"- {f}") 