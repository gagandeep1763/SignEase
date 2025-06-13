import os
import sys
import numpy as np
from pose_format import Pose
from spoken_to_signed.facial_expressions import add_facial_expressions
from spoken_to_signed.pose_visualizer import PoseVisualizer

def main():
    # Input and output paths
    input_pose_file = "ISL_lexicon/ins/kid.pose"
    output_video_file = "ISL_lexicon/Videos/output/kid_with_expressions.mp4"

    # Ensure input file exists
    if not os.path.exists(input_pose_file):
        print(f"Error: Input pose file not found at {input_pose_file}")
        sys.exit(1)

    try:
        # Read the pose file
        print("Reading pose file...")
        with open(input_pose_file, "rb") as f:
            pose = Pose.read(f.read())

        # Add facial expressions
        print("Adding facial expressions...")
        pose_with_expressions = add_facial_expressions(pose, "kid", enable_expressions=True)

        # Create visualizer with custom settings
        print("Creating visualizer...")
        visualizer = PoseVisualizer(pose_with_expressions)
        visualizer.thickness = 3
        visualizer.connection_color = (255, 255, 255)  # white lines
        visualizer.point_color = (255, 0, 0)           # red points
        visualizer.point_radius = 2
        visualizer.face_color = (0, 255, 0)            # green facial features
        visualizer.face_thickness = 1

        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_video_file), exist_ok=True)

        # Generate and save video
        print("Generating video...")
        frames = list(visualizer.draw())  # Convert generator to list
        if not frames:
            raise ValueError("No frames generated")
            
        visualizer.save_video(output_video_file, frames)
        print(f"✅ Video saved to: {output_video_file}")

    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 