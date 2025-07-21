import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import '../SignToText.css';
import { GrammarlyEditorPlugin } from '@grammarly/editor-sdk-react';
import { FaSyncAlt, FaLightbulb } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const SignToText = () => {
  const webcamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [currentSign, setCurrentSign] = useState('');
  const [sentence, setSentence] = useState('');
  const [correctedSentence, setCorrectedSentence] = useState('');
  const [translatedOutput, setTranslatedOutput] = useState('');
  const [language, setLanguage] = useState('en');
  const correctedRef = useRef(null);
  const detectedRef = useRef(null);
  const translatedRef = useRef(null);

  const langOptions = {
    English: 'en',
    Hindi: 'hi',
    Kannada: 'kn',
    Tamil: 'ta',
    Telugu: 'te',
    Malayalam: 'ml',
    Marathi: 'mr',
  };

  const navigate = useNavigate();
  const location = useLocation();

  const apiUrl = process.env.REACT_APP_API_URL;

  const startDetection = async () => {
    if (!cameraOn || !webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const response = await axios.post(`${apiUrl}/api/detect`, { image: imageSrc });
      const { detectedText } = response.data;
      setCurrentSign(detectedText);
    } catch (error) {
      setCurrentSign('Detection failed');
    }
  };

  // Deduplicate repeated bigrams
  function deduplicateBigrams(text) {
    const words = text.trim().split(/\s+/);
    if (words.length < 2) return text;
    const seen = new Set();
    let result = [];
    let i = 0;
    while (i < words.length - 1) {
      const bigram = words[i] + ' ' + words[i + 1];
      if (!seen.has(bigram)) {
        result.push(words[i], words[i + 1]);
        seen.add(bigram);
        i += 2;
      } else {
        i++;
      }
    }
    if (i === words.length - 1 && !result.includes(words[i])) {
      result.push(words[i]);
    }
    return result.join(' ');
  }

  // Deduplicate repeated words strictly (not just consecutive)
  function deduplicateWordsStrict(text) {
    const words = text.trim().split(/\s+/);
    const seen = new Set();
    return words.filter(word => {
      const lower = word.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    }).join(' ');
  }

  // Basic insertion of stop words for readability
  function insertStopWords(text) {
    const verbs = ['go', 'see', 'eat', 'play', 'run', 'walk', 'read', 'write', 'make', 'take', 'get', 'come', 'do', 'say', 'know', 'think', 'look', 'want', 'give', 'use', 'find', 'tell', 'ask', 'work', 'seem', 'feel', 'leave', 'call'];
    const pronouns = ['he', 'she', 'it', 'this', 'that', 'there'];
    const words = text.split(/\s+/);
    const result = [];

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (pronouns.includes(w.toLowerCase()) && words[i + 1] && !['is', 'was', 'are', 'were'].includes(words[i + 1].toLowerCase())) {
        result.push(w, 'is');
        continue;
      }
      if (verbs.includes(w.toLowerCase()) && i > 0 && words[i - 1].toLowerCase() !== 'to') {
        result.push('to', w);
        continue;
      }
      result.push(w);
    }

    return result.join(' ');
  }

  useEffect(() => {
    setCorrectedSentence('');
  }, [sentence]);

  useEffect(() => {
    if (detectedRef.current) {
      detectedRef.current.style.height = 'auto';
      detectedRef.current.style.height = detectedRef.current.scrollHeight + 'px';
    }
  }, [sentence]);

  useEffect(() => {
    if (correctedRef.current) {
      correctedRef.current.style.height = 'auto';
      correctedRef.current.style.height = correctedRef.current.scrollHeight + 'px';
    }
  }, [correctedSentence]);

  useEffect(() => {
    if (translatedRef.current) {
      translatedRef.current.style.height = 'auto';
      translatedRef.current.style.height = translatedRef.current.scrollHeight + 'px';
    }
  }, [translatedOutput]);

  useEffect(() => {
    let interval;
    if (cameraOn) {
      interval = setInterval(startDetection, 2000);
    }
    return () => clearInterval(interval);
  }, [cameraOn, startDetection]);

  const handleSave = () => {
    if (currentSign && currentSign !== 'Detection failed' && currentSign !== 'No hand detected') {
      setSentence((prev) => prev + ' ' + currentSign);
    }
  };

  const handleClear = () => {
    // Remove the last word from the sentence
    setSentence((prev) => {
      const words = prev.trim().split(/\s+/);
      if (words.length === 0) return '';
      words.pop();
      return words.join(' ');
    });
  };

  const handleRefresh = () => {
    setSentence('');
    setCorrectedSentence('');
    setTranslatedOutput('');
  };

  const handleCorrect = async () => {
    if (!sentence) return;

    // Step 1: Deduplicate
    let deduped = deduplicateBigrams(sentence);
    deduped = deduplicateWordsStrict(deduped);

    // Step 2: Insert stop words
    let withStops = insertStopWords(deduped);

    // Step 3: Grammar correction
    let corrected = withStops;
    try {
      const response = await fetch('https://api.languagetoolplus.com/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `text=${encodeURIComponent(withStops)}&language=en-US`
      });
      const data = await response.json();

      if (data.matches && data.matches.length > 0) {
        let offset = 0;
        for (const match of data.matches) {
          if (match.replacements && match.replacements.length > 0) {
            const replacement = match.replacements[0].value;
            corrected = corrected.slice(0, match.offset + offset) + replacement + corrected.slice(match.offset + match.length + offset);
            offset += replacement.length - match.length;
          }
        }
      }

      // Capitalize first letter
      if (corrected.length > 0) {
        corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
      }

      // Final deduplication
      corrected = deduplicateWordsStrict(corrected);

      setCorrectedSentence(corrected);
    } catch (error) {
      setCorrectedSentence('Correction failed');
    }
  };

  const handleTranslate = async () => {
    if (!correctedSentence) return;
    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${language}&dt=t&q=${encodeURIComponent(correctedSentence)}`);
      const data = await response.json();
      if (Array.isArray(data) && data[0] && data[0][0] && data[0][0][0]) {
        setTranslatedOutput(data[0][0][0]);
      } else {
        setTranslatedOutput('Translation failed');
      }
    } catch (error) {
      setTranslatedOutput('Translation failed');
    }
  };

  const inputStyle = {
    width: '100%',
    borderRadius: '10px',
    background: '#2d2d2d',
    color: 'white',
    padding: '12px 16px',
    fontSize: '15px',
    boxSizing: 'border-box'
  };

  const clientId = 'YOUR-GRAMMARLY-CLIENT-ID'; // Replace if using Grammarly plugin

  return (
    <div className="sign-page" style={{ minHeight: '100vh' }}>
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo-circle">
            <img src={require('../assets/logo.jpg')} alt="SignEase Logo" className="logo-img" />
          </div>
        </div>
        <ul className="navbar-links">
          <li><button className={location.pathname === "/home" ? "active" : ""} onClick={() => navigate('/home')}>Home</button></li>
          <li><button className={location.pathname === "/sign-concepts" ? "active" : ""} onClick={() => navigate('/sign-concepts')}>SIGN CONCEPTS</button></li>
          <li><button className={location.pathname === "/key-points" ? "active" : ""} onClick={() => navigate('/key-points')}>Key Points</button></li>
          <li><button className={location.pathname === "/contact" ? "active" : ""} onClick={() => navigate('/contact')}>Contact us</button></li>
        </ul>
        <button className="logout-btn" onClick={() => navigate('/')}>LOG OUT</button>
      </nav>
      <button className="back-button" onClick={() => navigate('/sign-concepts')}>BACK</button>
      <h2 className="title">Sign to Text from Sign Ease</h2>

      <div className="content-wrapper" style={{ flexDirection: 'row', justifyContent: 'center', gap: '32px', padding: '0 10px' }}>
        <div className="camera-section" style={{ minWidth: '320px', maxWidth: '340px', marginTop: '80px' }}>
          <h3 style={{ textAlign: 'center' }}>Camera</h3>
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

        <div className="output-section" style={{ maxWidth: '400px', marginTop: '32px', position: 'relative' }}>
          {/* Tips Button */}
          <button
            className="tips-float-btn"
            title="Show Tips"
            onClick={() => {
              const tips = document.getElementById('sign2text-tips');
              if (tips) tips.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ position: 'absolute', top: 5, right: 10, zIndex: 2, background: 'white', border: '2px solid #08BCD0', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <FaLightbulb color="#08BCD0" /> Tips
          </button>
          <div className="form-group">
            <label>Correct detected sign</label>
            <input type="text" value={currentSign || ""} readOnly style={inputStyle} />
          </div>
          <div className="form-group">
            <label>Detected sentence</label>
            <textarea ref={detectedRef} value={sentence || ""} readOnly style={{ ...inputStyle, resize: 'none', overflow: 'hidden' }} />
          </div>
          <div className="form-group button-group" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={handleSave}>Save</button>
            <button onClick={handleClear}>Clear</button>
            <button onClick={handleCorrect}>Correct</button>
          </div>
          <div className="form-group">
            <label>Corrected sentence</label>
            <GrammarlyEditorPlugin clientId={clientId}>
              <textarea ref={correctedRef} value={correctedSentence || ""} onChange={e => setCorrectedSentence(e.target.value)} style={{ ...inputStyle, resize: 'none', overflow: 'hidden' }} />
            </GrammarlyEditorPlugin>
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', justifyContent: 'center', alignItems: 'center' }}>
              <select value={language} onChange={e => setLanguage(e.target.value)} style={{ ...inputStyle, height: '40px', width: '120px' }}>
                {Object.entries(langOptions).map(([name, code]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
              <button onClick={handleTranslate} style={{ ...inputStyle, height: '40px', width: '100px' }}>Translate</button>
              <button onClick={handleRefresh} style={{ ...inputStyle, height: '40px', width: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <FaSyncAlt size={24} style={{ verticalAlign: 'middle' }} /> Refresh
              </button>
            </div>
            <label>Translated Sentence</label>
            <textarea ref={translatedRef} value={translatedOutput || ""} readOnly style={{ ...inputStyle, resize: 'none', overflow: 'hidden' }} />
          </div>
        </div>
      </div>
      {/* Tips Box */}
      <div className="help-text" id="sign2text-tips">
        <p><strong>Tips:</strong></p>
        <ul>
          <li>Ensure your hand is clearly visible in the camera frame for best recognition.</li>
          <li>Use a plain background and good lighting to improve detection accuracy.</li>
          <li>Hold each sign steady for a moment to allow the system to recognize it.</li>
          <li>Try to avoid fast or abrupt hand movements.</li>
          <li>Use the "Correct" button to fix or improve the detected sentence before translating.</li>
          <li>You can translate the corrected sentence into multiple languages using the dropdown.</li>
          <li>If the camera is not detected, check your browser permissions and ensure your normal webcam is connected and selected. Most built-in or USB webcams are supported.</li>
        </ul>
      </div>
    </div>
  );
};

export default SignToText;
