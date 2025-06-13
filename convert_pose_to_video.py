from pose_format import Pose
from pose_format.pose_visualizer import PoseVisualizer
import numpy as np
import cv2
from vidgear.gears import WriteGear

# --- Paths ---
pose_file = "ISL_lexicon/ins/label.pose"
output_file = "ISL_lexicon/Videos/output/Label.mp4"

# --- Load Pose ---
with open(pose_file, "rb") as f:
    pose = Pose.read(f.read())

# --- Centering and Upward Offset ---
pose_data = pose.body.data
confidence = pose.body.confidence

valid_points = confidence > 0.2
com = np.mean(pose_data[..., :2][valid_points], axis=0)
center = np.array([pose.header.dimensions.width / 2, pose.header.dimensions.height / 2])
offset = center - com + np.array([0, -300])  # Move up

pose.body.data[..., 0] += offset[0]
pose.body.data[..., 1] += offset[1]

# --- Visualization Setup ---
visualizer = PoseVisualizer(pose)
visualizer.thickness = 3
visualizer.connection_color = (255, 255, 255)  # white lines
visualizer.point_color = (255, 0, 0)           # red points
visualizer.point_radius = 2

frames = []

# --- Frame Generation ---
for frame in visualizer.draw():
    # Remove white background
    frame[np.all(frame == [255, 255, 255], axis=-1)] = 0

    # Remove top-left red/white artifacts
    h, w = frame.shape[:2]
    frame[:int(h * 0.04), :] = 0
    frame[:, :int(w * 0.01)] = 0
    frame[0:int(h * 0.8), 0:int(w * 0.3)] = 0  # Extra: wipe 20% box in top-left

    enhanced_frame = np.zeros_like(frame)

    # Create grayscale mask
    frame_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(frame_gray, 1, 255, cv2.THRESH_BINARY)

    # Cut off bottom part (legs)
    leg_cutoff = int(h * 0.6)
    mask[leg_cutoff:, :] = 0

    # Remove small stray blobs
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    min_size = 100
    for i in range(1, num_labels):
        if stats[i, cv2.CC_STAT_AREA] < min_size:
            mask[labels == i] = 0

    # Copy pose content to enhanced frame
    enhanced_frame[mask > 0] = frame[mask > 0]

    # Highlight facial features (optional enhancement)
    face_mask = frame_gray > 0
    face_region = frame[face_mask]
    if len(face_region) > 0:
        enhanced_frame[face_mask] = cv2.addWeighted(face_region, 1.2, np.zeros_like(face_region), 0, 5)
        face_edges = cv2.Canny(frame, 100, 200)
        enhanced_frame[face_edges > 0] = [255, 255, 255]

    # Final cleanup: Morphological opening
    kernel = np.ones((3, 3), np.uint8)
    opened_mask = cv2.morphologyEx(enhanced_frame, cv2.MORPH_OPEN, kernel)
    final_mask = opened_mask.any(axis=2).astype(np.uint8)
    enhanced_frame = cv2.bitwise_and(enhanced_frame, enhanced_frame, mask=final_mask)

    frames.append(enhanced_frame)

# --- Video Writer ---
output_params = {
    "-vcodec": "libx264",
    "-preset": "slow",
    "-input_framerate": pose.body.fps,
    "-pix_fmt": "yuv420p",
    "-crf": "18"
}
writer = WriteGear(output=output_file, logging=True, **output_params)
for f in frames:
    writer.write(f)
writer.close()

print(" Video successfully saved to:", output_file)
