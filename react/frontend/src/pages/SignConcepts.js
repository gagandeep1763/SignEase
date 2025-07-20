import React from 'react';
import '../styles/SignConcepts.css';
import logoImg from '../assets/logo.jpg';
import text2SignImg from '../assets/TEXT2SIGN.jpg';
import sign2TextImg from '../assets/SIGN2TEXT.jpg';
import learnSignImg from '../assets/LEARNSIGNLANGUAGE.jpg';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const SignConcepts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="sign-concepts">
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

      <div className="concepts-container">
        <h1>Sign Concepts from Sign Ease</h1>
        
        <div className="concepts-grid">
          <Link to="/text-to-sign" className="concept-card">
            <img src={text2SignImg} alt="Text to Sign" className="concept-image" />
          </Link>

          <Link to="/sign-to-text" className="concept-card">
            <img src={sign2TextImg} alt="Sign to Text" className="concept-image" />
          </Link>

          <Link to="/learn-sign" className="concept-card">
            <img src={learnSignImg} alt="Learn Sign Language" className="concept-image" />
          </Link>
        </div>

        <p className="concept-footer">
          The human brain processes sign language in the same area used for spoken language—proving that communication is about meaning, not sound!
        </p>
      </div>
    </div>
  );
};

export default SignConcepts; 