import React, { useState } from 'react';
import '../styles/learnsignpage.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export default function LearnSignPage() {
  const [activeTab, setActiveTab] = useState('letters');
  const [popupImage, setPopupImage] = useState(null);
  const items = activeTab === 'letters' ? letters : numbers;
  const location = useLocation();
  const navigate = useNavigate();

  const handleItemClick = (sign) => {
    setPopupImage(`/assets/${sign.toLowerCase()}.jpg`);
  };

  const closePopup = () => {
    setPopupImage(null);
  };

  return (
    <div className="sign-page">
      {/* Navigation */}
      <div className="navbar">
        <div className="logo-container">
          <img src={logoImg} alt="Logo" className="logo-img" />
        </div>
        <ul className="nav-links">
          <li><Link to="/home" className={location.pathname === "/home" ? "active" : ""}>Home</Link></li>
          <li><Link to="/sign-concepts" className={location.pathname === "/sign-concepts" ? "active" : ""}>Sign Concepts</Link></li>
          <li><Link to="/key-points" className={location.pathname === "/key-points" ? "active" : ""}>Key Points</Link></li>
          <li><Link to="/contact" className={location.pathname === "/contact" ? "active" : ""}>Contact us</Link></li>
        </ul>
        <button className="logout-btn" onClick={() => navigate('/')}>LOG OUT</button>
      </div>

     
      <button className="back-btn" onClick={() => navigate('/sign-concepts')}>BACK</button>

      {/* Main Content */}
      <div className="container">
        <h1>Learn Indian Sign Language</h1>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'letters' ? 'active' : ''}`}
            onClick={() => setActiveTab('letters')}
          >
            Letters
          </button>
          <button
            className={`tab ${activeTab === 'numbers' ? 'active' : ''}`}
            onClick={() => setActiveTab('numbers')}
          >
            Numbers
          </button>
        </div>

        <div className={`grid ${activeTab === 'letters' ? 'grid-letters' : 'grid-numbers'}`}>
          {items.map((sign) => (
            <div
              key={sign}
              className="sign-item"
              onClick={() => handleItemClick(sign)}
            >
              {sign}
            </div>
          ))}
        </div>
      </div>

      {/* Popup */}
      {popupImage && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup">
            <span className="close-btn" onClick={closePopup}>
              &times;
            </span>
            <img src={popupImage} alt="Sign" />
          </div>
        </div>
      )}
    </div>
  );
}
