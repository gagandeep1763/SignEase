import pandas as pd

# Load the CSV file
csv_path = "C:/Users/DELL/Downloads/isl_gif/gesture_data.csv"
df = pd.read_csv(csv_path)

# List of labels you want to remove
unwanted_labels = ["Charger"]

# Remove rows with those labels
filtered_df = df[~df['label'].isin(unwanted_labels)]

# Save the cleaned CSV
filtered_df.to_csv("gesture_data.csv", index=False)

# Count and print number of unique labels
label_count = filtered_df['label'].nunique()
print(f"Filtered CSV saved successfully. Number of unique labels: {label_count}")
