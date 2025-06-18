import React from 'react';
import '../styles/SignConcepts.css';
import logoImg from '../assets/logo.jpg';
import text2SignImg from '../assets/TEXT2SIGN.jpg';
import sign2TextImg from '../assets/SIGN2TEXT.jpg';
import image2TextImg from '../assets/IMAGE2TEXT.jpg';
import learnSignImg from '../assets/LEARNSIGNLANGUAGE.jpg';
import { Link } from 'react-router-dom';

const SignConcepts = () => {
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
          <li><Link to="/">Home</Link></li>
          <li><Link to="/sign-concepts" className="active">SIGN CONCEPTS</Link></li>
          <li><Link to="/key-points">Key Points</Link></li>
          <li><Link to="/contact">Contact us</Link></li>
        </ul>
        <button className="logout-btn">LOG OUT</button>
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

          <Link to="/image-to-text" className="concept-card">
            <img src={image2TextImg} alt="Image to Text" className="concept-image" />
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