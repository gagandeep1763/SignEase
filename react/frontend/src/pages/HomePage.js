import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

import signLanguageImg from '../assets/signlanguage.jpg';

import logoImg from '../assets/logo.jpg';

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="homepage">
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo-circle">
            <img 
              src={logoImg} 
              alt="SignEase Logo" 
              className="logo-img"
              loading="eager"  
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

      <div className="main">
        <div className="main-left">
          <h1>Welcome to SignEase</h1>
          <p>
            Sign language isn't just about hand signs—<br />
            facial expressions and body movements play a vital<br />
            role in conveying emotions, tone, and clarity<br />
            in communication!
          </p>
          <button className="start-btn" onClick={() => navigate('/sign-concepts')}>Get started</button>
          <p className="subtext">
            Technology like Sign-Ease is helping bridge the<br />
            communication gap
          </p>
        </div>
        <div className="main-right">
          <img 
            src={signLanguageImg}
            alt="Sign Language" 
            className="main-image" 
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
