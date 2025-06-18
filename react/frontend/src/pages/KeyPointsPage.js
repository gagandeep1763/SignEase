import React from "react";
import "../styles/keypoints.css";
import keypoints1 from '../assets/keypoints1.jpg';
import keypoints2 from '../assets/keypoints2.jpg';
import keypoints3 from '../assets/keypoints3.jpg';
import keypoints4 from '../assets/keypoints4.jpg';
import keypoints5 from '../assets/keypoints5.jpg';
import keypoints6 from '../assets/keypoints6.jpg';
import logoImg from '../assets/logo.jpg';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const keyPoints = [
  {
    image: keypoints1,
    text: "The human brain processes sign language in the same area used for spoken language—proving that communication is about meaning, not sound!"
  },
  {
    image: keypoints2,
    text: "Every gesture in sign language represents a concept or idea. Sign languages are visual languages that convey information without a single sound!"
  },
  {
    image: keypoints3,
    text: "Technology like Sign-Ease is helping bridge the communication gap—making meaningful conversations more accessible!"
  },
  {
    image: keypoints4,
    text: "Sign language isn't just about hand signs. It also uses facial expressions, movements, and posture to convey emotion and grammar!"
  },
  {
    image: keypoints5,
    text: "Did you know sign isn't universal—different countries have different sign languages, just like spoken ones!"
  },
  {
    image: keypoints6,
    text: "Sign language is fully developed language with grammar, structure, and rules—just like spoken languages!"
  }
];

export default function KeyPointsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="keypoints-page">
      <header className="navbar">
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
        <nav>
          <ul className="navbar-links">
            <li><Link to="/home" className={location.pathname === "/home" ? "active" : ""}>Home</Link></li>
            <li><Link to="/sign-concepts" className={location.pathname === "/sign-concepts" ? "active" : ""}>Sign Concepts</Link></li>
            <li><Link to="/key-points" className={location.pathname === "/key-points" ? "active" : ""}>Key Points</Link></li>
            <li><Link to="/contact" className={location.pathname === "/contact" ? "active" : ""}>Contact us</Link></li>
          </ul>
        </nav>
        <button className="logout-button" onClick={() => navigate('/')}>LOG OUT</button>
      </header>

      <main>
        <h1 className="title">Key Points to Remember</h1>
        <div className="cards-container">
          {keyPoints.map((point, index) => (
            <div key={index} className="card">
              <img src={point.image} alt={`Point ${index + 1}`} />
              <p><strong>Did you know?</strong><br />{point.text}</p>
            </div>
          ))}
        </div>
        <div className="footer-card">
          <p>
            Sign language is a visual form of communication using hand gestures, facial expressions, and body language. It bridges the gap
            between hearing and non-hearing individuals, making communication inclusive and accessible.
          </p>
        </div>
      </main>
    </div>
  );
} 