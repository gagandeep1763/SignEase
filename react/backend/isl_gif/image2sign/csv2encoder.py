
import pandas as pd
import numpy as np
import joblib
import json
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# Load dataset
csv_path = "C:/Users/DELL/Downloads/isl_gif/gesture_data.csv"
if not os.path.exists(csv_path):
    print(f"❌ File not found: {csv_path}")
    exit()

df = pd.read_csv(csv_path)
if "label" not in df.columns:
    print("❌ 'label' column missing in CSV.")
    exit()

# Split features and labels
X = df.drop(columns=["label"])
y = df["label"]

# Encode labels
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# Train model
model = RandomForestClassifier()
model.fit(X, y_encoded)

# Save files in current folder
base_path = os.getcwd()

encoder_path = os.path.join(base_path, "label_encoder.pkl")
model_path = os.path.join(base_path, "gesture_model.pkl")
json_path = os.path.join(base_path, "labels.json")

joblib.dump(le, encoder_path)
joblib.dump(model, model_path)

label_dict = {str(i): label for i, label in enumerate(le.classes_)}
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(label_dict, f, indent=2)

# Summary
print("\n🎉 All files saved successfully in current folder:")
print(f"📄 gesture_model.pkl")
print(f"📄 label_encoder.pkl")
print(f"📄 labels.json")
