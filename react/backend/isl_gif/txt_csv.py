import csv
import ast
txt_file = "Temple.txt"
csv_path = r"C:/Users/DELL/Downloads/isl_gif/gesture_data.csv"
label = "I went to temple"  # Updated label to match the file

print("Starting script...")

with open(txt_file, 'r') as f_txt:
    lines = f_txt.readlines()
print(f"Read {len(lines)} lines from {txt_file}")

with open(csv_path, 'a', newline='') as f_csv:
    writer = csv.writer(f_csv)
    for i, line in enumerate(lines):
        try:
            landmarks = ast.literal_eval(line.strip())
            flat = [coord for point in landmarks for coord in point]
            flat.append(label)
            writer.writerow(flat)
        except Exception as e:
            print(f"Skipped malformed line {i}: {e}")

print("✅ Finished writing to CSV.")
