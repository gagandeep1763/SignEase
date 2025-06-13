from pose_format.pose_visualizer import PoseVisualizer as BasePoseVisualizer
import numpy as np
import cv2

class PoseVisualizer(BasePoseVisualizer):
    def __init__(self, pose, **kwargs):
        super().__init__(pose, **kwargs)
        self.face_color = (0, 255, 0)  # Green for facial features
        self.face_thickness = 1
        
    def draw_face_component(self, frame, points, confidence):
        """Draw facial landmarks and connections."""
        if 'FACE' not in self.pose.header.components_names():
            return frame
            
        face_idx = self.pose.header.components_names().index('FACE')
        start_idx = sum(len(c.points) for c in self.pose.header.components[:face_idx])
        
        def draw_feature(indices, close=False):
            pts = points[indices].astype(np.int32)
            if close:
                cv2.polylines(frame, [pts], True, self.face_color, self.face_thickness)
            else:
                for i in range(len(pts) - 1):
                    if confidence[indices[i]] > 0.2 and confidence[indices[i + 1]] > 0.2:
                        cv2.line(frame, tuple(pts[i]), tuple(pts[i + 1]), 
                               self.face_color, self.face_thickness)
        
        # Draw eyes
        left_eye_indices = range(start_idx, start_idx + 8)
        right_eye_indices = range(start_idx + 8, start_idx + 16)
        draw_feature(left_eye_indices, close=True)
        draw_feature(right_eye_indices, close=True)
        
        # Draw eyebrows
        left_brow_indices = range(start_idx + 16, start_idx + 21)
        right_brow_indices = range(start_idx + 21, start_idx + 26)
        draw_feature(left_brow_indices)
        draw_feature(right_brow_indices)
        
        # Draw mouth
        mouth_outer_indices = range(start_idx + 26, start_idx + 44)
        mouth_inner_indices = range(start_idx + 44, start_idx + 62)
        draw_feature(mouth_outer_indices, close=True)
        draw_feature(mouth_inner_indices, close=True)
        
        return frame
    
    def draw_frame(self, frame_idx: int = 0):
        """Override draw_frame to include facial landmarks."""
        frame = super().draw_frame(frame_idx)
        
        if frame is not None and 'FACE' in self.pose.header.components_names():
            points = self.pose.body.data[frame_idx, 0]
            confidence = self.pose.body.confidence[frame_idx, 0]
            frame = self.draw_face_component(frame, points, confidence)
        
        return frame 