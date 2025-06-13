import mediapipe as mp
import numpy as np
import cv2
from typing import Dict, List, Tuple
from pose_format import Pose
from pose_format.pose_header import PoseHeader, PoseHeaderComponent

# Initialize MediaPipe FaceMesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Define important facial landmark indices
FACIAL_LANDMARKS = {
    'left_eye': [33, 133, 157, 158, 159, 160, 161, 246],  # Left eye contour
    'right_eye': [362, 263, 386, 387, 388, 389, 390, 466],  # Right eye contour
    'left_eyebrow': [70, 63, 105, 66, 107],  # Left eyebrow
    'right_eyebrow': [300, 293, 334, 296, 336],  # Right eyebrow
    'mouth_outer': [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181],  # Outer lip
    'mouth_inner': [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178],  # Inner lip
}

def create_face_component() -> PoseHeaderComponent:
    """Create a new pose component for facial landmarks."""
    points = [
        "left_eye_1", "left_eye_2", "left_eye_3", "left_eye_4", "left_eye_5", "left_eye_6", "left_eye_7", "left_eye_8",
        "right_eye_1", "right_eye_2", "right_eye_3", "right_eye_4", "right_eye_5", "right_eye_6", "right_eye_7", "right_eye_8",
        "left_eyebrow_1", "left_eyebrow_2", "left_eyebrow_3", "left_eyebrow_4", "left_eyebrow_5",
        "right_eyebrow_1", "right_eyebrow_2", "right_eyebrow_3", "right_eyebrow_4", "right_eyebrow_5",
        "mouth_outer_1", "mouth_outer_2", "mouth_outer_3", "mouth_outer_4", "mouth_outer_5", "mouth_outer_6",
        "mouth_outer_7", "mouth_outer_8", "mouth_outer_9", "mouth_outer_10", "mouth_outer_11", "mouth_outer_12",
        "mouth_outer_13", "mouth_outer_14", "mouth_outer_15", "mouth_outer_16", "mouth_outer_17", "mouth_outer_18",
        "mouth_inner_1", "mouth_inner_2", "mouth_inner_3", "mouth_inner_4", "mouth_inner_5", "mouth_inner_6",
        "mouth_inner_7", "mouth_inner_8", "mouth_inner_9", "mouth_inner_10", "mouth_inner_11", "mouth_inner_12",
        "mouth_inner_13", "mouth_inner_14", "mouth_inner_15", "mouth_inner_16", "mouth_inner_17", "mouth_inner_18"
    ]
    
    # Create edges for connecting facial features
    edges = []
    
    # Connect left eye points
    for i in range(7):
        edges.append([i, i + 1])
    edges.append([7, 0])  # Close the left eye loop
    
    # Connect right eye points
    for i in range(8, 15):
        edges.append([i, i + 1])
    edges.append([15, 8])  # Close the right eye loop
    
    # Connect left eyebrow points
    for i in range(16, 20):
        edges.append([i, i + 1])
    
    # Connect right eyebrow points
    for i in range(21, 25):
        edges.append([i, i + 1])
    
    # Connect outer mouth points
    for i in range(26, 43):
        edges.append([i, i + 1])
    edges.append([43, 26])  # Close the outer mouth loop
    
    # Connect inner mouth points
    for i in range(44, 61):
        edges.append([i, i + 1])
    edges.append([61, 44])  # Close the inner mouth loop
    
    # Convert edges to numpy array
    edges = np.array(edges, dtype=np.uint32)
    
    # Create colors for each point (using white for all points)
    colors = np.full((len(points), 3), 255, dtype=np.uint8)
    
    return PoseHeaderComponent(
        name="FACE",
        points=points,
        limbs=edges,  # Use limbs instead of edges
        colors=colors,  # Add colors parameter
        point_format=["x", "y", "z"]  # Add point_format parameter
    )

def extract_face_landmarks(image: np.ndarray) -> Dict[str, np.ndarray]:
    """Extract facial landmarks from an image using MediaPipe FaceMesh."""
    results = face_mesh.process(image)
    if not results.multi_face_landmarks:
        return None
    
    landmarks = results.multi_face_landmarks[0].landmark
    landmarks_dict = {}
    
    for feature, indices in FACIAL_LANDMARKS.items():
        points = []
        for idx in indices:
            landmark = landmarks[idx]
            points.append([landmark.x, landmark.y, landmark.z])
        landmarks_dict[feature] = np.array(points)
    
    return landmarks_dict

def adjust_facial_expression(landmarks: Dict[str, np.ndarray], gloss: str) -> Dict[str, np.ndarray]:
    """Adjust facial landmarks based on gloss content."""
    if not landmarks:
        return landmarks
        
    # Copy landmarks to avoid modifying the original
    adjusted = {k: v.copy() for k, v in landmarks.items()}
    
    # Question words: raise eyebrows and widen eyes
    if any(word in gloss.lower() for word in ['what', 'where', 'when', 'who', 'why', 'how']):
        # Raise eyebrows
        adjusted['left_eyebrow'][:, 1] -= 0.02  # Move up
        adjusted['right_eyebrow'][:, 1] -= 0.02
        # Widen eyes
        adjusted['left_eye'][:, 1] -= 0.01
        adjusted['right_eye'][:, 1] -= 0.01
    
    # Emotional expressions
    if 'happy' in gloss.lower():
        # Curve mouth upwards
        adjusted['mouth_outer'][8:11, 1] -= 0.015  # Raise corners
        adjusted['mouth_inner'][8:11, 1] -= 0.015
    elif 'sad' in gloss.lower():
        # Curve mouth downwards
        adjusted['mouth_outer'][8:11, 1] += 0.015  # Lower corners
        adjusted['mouth_inner'][8:11, 1] += 0.015
    elif 'angry' in gloss.lower():
        # Lower eyebrows and narrow eyes
        adjusted['left_eyebrow'][:, 1] += 0.02
        adjusted['right_eyebrow'][:, 1] += 0.02
        adjusted['left_eye'][:, 1] += 0.005
        adjusted['right_eye'][:, 1] += 0.005
    
    return adjusted

def integrate_face_landmarks(pose: Pose, landmarks_dict: Dict[str, np.ndarray]) -> Pose:
    """Integrate facial landmarks into the pose data."""
    # Create new header with face component
    face_component = create_face_component()
    new_components = pose.header.components + [face_component]
    new_header = PoseHeader(
        version=pose.header.version,
        dimensions=pose.header.dimensions,
        components=new_components
    )
    
    # Prepare face data
    face_points = []
    for feature in FACIAL_LANDMARKS.keys():
        face_points.extend(landmarks_dict[feature])
    face_data = np.array(face_points)
    
    # Create new data array with face points
    old_shape = pose.body.data.shape
    new_shape = (old_shape[0], old_shape[1], old_shape[2] + len(face_points), old_shape[3])
    new_data = np.zeros(new_shape)
    
    # Copy existing data
    new_data[..., :old_shape[2], :] = pose.body.data
    
    # Add face data
    new_data[..., old_shape[2]:, :] = face_data
    
    # Update confidence values
    new_conf = np.ones((new_shape[0], new_shape[1], new_shape[2]))
    new_conf[..., :old_shape[2]] = pose.body.confidence
    
    # Create new pose
    new_body = pose.body.__class__(
        fps=pose.body.fps,
        data=new_data,
        confidence=new_conf
    )
    
    return Pose(new_header, new_body)

def get_frame_image(pose: Pose, frame_idx: int = 0) -> np.ndarray:
    """Convert pose frame data to image for MediaPipe processing."""
    # Create a blank image
    height = int(pose.header.dimensions.height)
    width = int(pose.header.dimensions.width)
    image = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Draw pose points on the image
    points = pose.body.data[frame_idx, 0]
    confidence = pose.body.confidence[frame_idx, 0]
    
    for i in range(len(points)):
        if confidence[i] > 0.2:
            x, y = int(points[i, 0]), int(points[i, 1])
            if 0 <= x < width and 0 <= y < height:
                cv2.circle(image, (x, y), 2, (255, 255, 255), -1)
    
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # Convert to RGB for MediaPipe

def add_facial_expressions(pose: Pose, gloss: str, enable_expressions: bool = True) -> Pose:
    """Add facial expressions to a pose based on the gloss.
    
    Args:
        pose (Pose): The input pose to add expressions to
        gloss (str): The gloss token to determine expressions
        enable_expressions (bool): Whether to enable facial expressions
        
    Returns:
        Pose: A new pose with facial expressions added
    """
    if not enable_expressions:
        return pose
        
    # Create a copy of the pose to modify
    new_pose = pose.clone()
    
    # Add face component to header if not present
    if "FACE" not in new_pose.header.components_names():
        face_component = create_face_component()
        new_pose.header.components.append(face_component)
        
        # Initialize face data arrays
        num_frames = new_pose.body.data.shape[0]
        num_people = new_pose.body.data.shape[1]
        num_face_points = len(face_component.points)
        
        # Create arrays for face data and confidence
        face_data = np.zeros((num_frames, num_people, num_face_points, 3))
        face_conf = np.ones((num_frames, num_people, num_face_points))
        
        # Add face data to body
        new_pose.body.data = np.concatenate([new_pose.body.data, face_data], axis=2)
        new_pose.body.confidence = np.concatenate([new_pose.body.confidence, face_conf], axis=2)
    
    # Get indices for facial features
    face_idx = new_pose.header.components_names().index("FACE")
    start_idx = sum(len(c.points) for c in new_pose.header.components[:face_idx])
    
    # Add basic expressions based on gloss
    # For now just add some dummy expressions
    for frame in range(new_pose.body.data.shape[0]):
        for person in range(new_pose.body.data.shape[1]):
            # Set some basic eye positions
            eye_y = 0.5  # Neutral eye position
            if "?" in gloss:
                eye_y = 0.7  # Raised eyebrows for questions
            
            # Left eye
            for i in range(8):
                idx = start_idx + i
                new_pose.body.data[frame, person, idx] = [0.3 + 0.1 * i, eye_y, 0]
                
            # Right eye  
            for i in range(8):
                idx = start_idx + 8 + i
                new_pose.body.data[frame, person, idx] = [0.7 + 0.1 * i, eye_y, 0]
                
            # Eyebrows
            brow_y = eye_y + 0.1
            for i in range(5):
                # Left eyebrow
                idx = start_idx + 16 + i
                new_pose.body.data[frame, person, idx] = [0.3 + 0.1 * i, brow_y, 0]
                
                # Right eyebrow
                idx = start_idx + 21 + i  
                new_pose.body.data[frame, person, idx] = [0.7 + 0.1 * i, brow_y, 0]
                
            # Mouth - make a basic smile
            mouth_y = 0.3
            if "happy" in gloss.lower():
                mouth_y = 0.4  # Smile
            elif "sad" in gloss.lower():
                mouth_y = 0.2  # Frown
                
            # Outer mouth points
            for i in range(18):
                idx = start_idx + 26 + i
                angle = 2 * np.pi * i / 18
                x = 0.5 + 0.2 * np.cos(angle)
                y = mouth_y + 0.1 * np.sin(angle)
                new_pose.body.data[frame, person, idx] = [x, y, 0]
                
            # Inner mouth points
            for i in range(18):
                idx = start_idx + 44 + i
                angle = 2 * np.pi * i / 18
                x = 0.5 + 0.1 * np.cos(angle)
                y = mouth_y + 0.05 * np.sin(angle)
                new_pose.body.data[frame, person, idx] = [x, y, 0]
    
    return new_pose 