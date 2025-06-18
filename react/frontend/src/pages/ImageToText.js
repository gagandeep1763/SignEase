import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/ImageToText.css';
import logoImg from '../assets/logo.jpg';
import { gestureService } from '../services/gestureService';

const ImageToText = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const validateImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        
        try {
          const imageData = ctx.getImageData(0, 0, 1, 1);
          if (imageData.data.length >= 3) {
            resolve(true);
          } else {
            reject(new Error('Image must be in RGB format'));
          }
        } catch (e) {
          reject(new Error('Failed to process image. Please try a different image.'));
        }
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await validateImage(file);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setPrediction(null);
        setError(null);
      } catch (err) {
        setError(err.message);
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    }
  };

  const handlePrediction = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPrediction(null);

      const result = await gestureService.predictFromFile(selectedFile);
      setPrediction(result);
    } catch (error) {
      setError(error.message || 'Failed to predict gesture. Please ensure your hand is clearly visible in the image.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="image-to-text-page">
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo-circle">
            <img 
              src={logoImg} 
              alt="SignEase Logo" 
              className="logo-img"
            />
          </div>
        </div>
        <ul className="navbar-links">
          <li><Link to="/home" className={location.pathname === "/home" ? "active" : ""}>Home</Link></li>
          <li><Link to="/sign-concepts" className={location.pathname === "/sign-concepts" ? "active" : ""}>Sign Concepts</Link></li>
          <li><Link to="/key-points" className={location.pathname === "/key-points" ? "active" : ""}>Key Points</Link></li>
          <li><Link to="/contact" className={location.pathname === "/contact" ? "active" : ""}>Contact us</Link></li>
        </ul>
        <button className="logout-btn" onClick={() => navigate('/')}>LOG OUT</button>
      </nav>

      <Link to="/sign-concepts" className="back-button">
        BACK
      </Link>

      <h1 className="page-title">Image to text from Sign Ease</h1>

      <div className="prediction-container">
        <div className="prediction-card">
          <h2>Gesture Prediction</h2>
          
          {previewUrl && (
            <div className="preview-container">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="preview-image"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-input"
          />
          <label htmlFor="file-input" className="choose-file-btn">
            Choose File
          </label>
          
          {selectedFile ? (
            <div className="file-status">
              Selected: {selectedFile.name}
            </div>
          ) : (
            <div className="file-status">
              No files chosen yet
            </div>
          )}
          
          <button 
            className="predict-btn"
            onClick={handlePrediction}
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? 'Processing...' : 'Predict'}
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {prediction && (
            <div className="prediction-result">
              <h3>Predicted Gesture:</h3>
              <p className="prediction-text">{prediction.gesture}</p>
              {prediction.confidence && (
                <p className="confidence-text">
                  Confidence: {(prediction.confidence * 100).toFixed(2)}%
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageToText; 