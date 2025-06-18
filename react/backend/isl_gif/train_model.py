import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

# Get current directory path
current_dir = os.path.dirname(os.path.abspath(__file__))

# Define paths relative to current directory
data_path = os.path.join(current_dir, 'gesture_data.csv')
model_dir = os.path.join(current_dir, 'gesture-recognition')
os.makedirs(model_dir, exist_ok=True)

print(f"Loading data from: {data_path}")
df = pd.read_csv(data_path)
X = df.drop('label', axis=1)
y = df['label']

# Scale the features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Train the model
print("Training Random Forest model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred) * 100
print(f"Model Accuracy: {accuracy:.2f}%")

# Save the model and scaler
model_path = os.path.join(model_dir, 'gesture_model.pkl')
scaler_path = os.path.join(model_dir, 'gesture_scaler.pkl')

print(f"Saving model to: {model_path}")
joblib.dump(model, model_path)
print(f"Saving scaler to: {scaler_path}")
joblib.dump(scaler, scaler_path)

print("Training completed successfully!")
