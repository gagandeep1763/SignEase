import pandas as pd

# Load the CSV file
csv_path = "C:/Users/DELL/Downloads/isl_gif/gesture_data.csv"
df = pd.read_csv(csv_path)

# Dictionary of labels to rename: {'old_label': 'new_label'}
label_renames = {
    'Washroom': "Toilet"
    # Add more if needed
}

# Replace the labels
df['label'] = df['label'].replace(label_renames)

# Overwrite the same CSV file
df.to_csv(csv_path, index=False)

print("Label names updated and saved successfully in the same file.")
