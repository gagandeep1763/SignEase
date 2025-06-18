import React, { useState } from 'react';
import './Login.css'; // You can put shared styles here
import GoogleSignInButton from '../components/GoogleSignInButton';
import { Link } from 'react-router-dom';
import signupImage from '../assets/sign-up.png'; // add your image in assets and name it accordingly
import GoogleIcon from '../assets/google-icon.png';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();
    // You can trigger firebase auth here
    console.log({ name, email, password });
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <img src={signupImage} alt="Sign Language Illustration" />
        <p>
          Sign language is a visual language that uses hand gestures, facial
          expressions and body movements to communicate.
        </p>
      </div>
      <div className="signup-right">
        <h1>Sign Ease</h1>
        <p className="tagline">"Where Signs Speak Louder Than Words"</p>
        <div className="form-container">
          <h2>Lets Register Account</h2>
          <p>Hello user , you have a greatful journey</p>
          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Signup</button>
          </form>
          <div className="divider">
            <span>or</span>
          </div>
          <div className="social-buttons">
            <GoogleSignInButton />
            <button className="facebook-signin">F</button>
          </div>
          <p className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
