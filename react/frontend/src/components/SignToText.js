// SignToText.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Webcam from 'react-webcam';
import axios from 'axios';
import './SignToText.css';
import logoImg from '../assets/logo.jpg';

const SignToText = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const webcamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [textOutput, setTextOutput] = useState('');
  const [translatedOutput, setTranslatedOutput] = useState('');
  const [language, setLanguage] = useState('en');

  const langOptions = {
    English: 'en',
    Hindi: 'hi',
    Kannada: 'kn',
    Tamil: 'ta',
    Telugu: 'te',
    Malayalam: 'ml'
  };

  const apiUrl = process.env.REACT_APP_API_URL;

  const startDetection = async () => {
    if (!cameraOn || !webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const response = await axios.post(`${apiUrl}/api/detect`, { image: imageSrc });
      const { detectedText } = response.data;
      setTextOutput(detectedText);

      if (language !== 'en') {
        const translateResponse = await axios.post(`${apiUrl}/api/translate`, {
          text: detectedText,
          targetLang: language
        });
        setTranslatedOutput(translateResponse.data.translatedText);
      } else {
        setTranslatedOutput(detectedText);
      }
    } catch (error) {
      console.error('Detection failed:', error);
      setTextOutput('Detection failed');
      setTranslatedOutput('');
    }
  };

  useEffect(() => {
    let interval;
    if (cameraOn) {
      interval = setInterval(startDetection, 2000);
    }
    return () => clearInterval(interval);
  }, [cameraOn, language]);

  return (
    <div className="sign-page">
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo-circle">
            <img src={logoImg} alt="SignEase Logo" className="logo-img" loading="eager" />
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

      <button onClick={() => navigate('/sign-concepts')} className="back-button">BACK</button>
      <h2 className="title">Sign to Text from Sign Ease</h2>

      <div className="content-wrapper">
        <div className="camera-section">
          <h3>Camera</h3>
          <div className="camera-box">
            {cameraOn ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }}
              />
            ) : (
              <div className="camera-placeholder">Camera is Off</div>
            )}
          </div>
          <div className="camera-buttons">
            <button onClick={() => setCameraOn(true)}>Camera On</button>
            <button onClick={() => setCameraOn(false)}>Camera Off</button>
          </div>
        </div>

        <div className="output-section">
          <div className="form-group">
            <label>Text Output:</label>
            <textarea value={textOutput} readOnly className="output-box" />
          </div>

          <div className="form-group">
            <label>Translated Output:</label>
            <textarea value={translatedOutput} readOnly className="output-box" />
          </div>

          <div className="form-group select-wrapper">
            <label>Select Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="lang-select"
            >
              {Object.entries(langOptions).map(([name, code]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignToText;