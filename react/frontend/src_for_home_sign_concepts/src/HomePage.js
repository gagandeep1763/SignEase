import React from 'react';
import { Link } from 'react-router-dom';
import './styles/HomePage.css';
// Import the image directly from assets
import signLanguageImg from './assets/signlanguage.jpg';
// Import logo with require to ensure proper loading
import logoImg from './assets/logo.jpg';

const HomePage = () => {
  return (
    <div className="homepage">
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo-circle">
            <img 
              src={logoImg} 
              alt="SignEase Logo" 
              className="logo-img"
              loading="eager"  // Prioritize logo loading
            />
          </div>
        </div>
        <ul className="navbar-links">
          <li><Link to="/">HOME</Link></li>
          <li><Link to="/sign-concepts">Sign Concepts</Link></li>
          <li><Link to="/key-points">Key Points</Link></li>
          <li><Link to="/contact">Contact us</Link></li>
        </ul>
        <button className="logout-btn">LOG OUT</button>
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
          <button className="start-btn">Get started</button>
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
