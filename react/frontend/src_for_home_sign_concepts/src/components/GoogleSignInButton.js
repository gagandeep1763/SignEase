import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase/config';
import GoogleIcon from '../assets/google-icon.png';
import './GoogleSignInButton.css';

const GoogleSignInButton = () => {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <button className="google-signin-button" onClick={handleGoogleSignIn}>
      <img src={GoogleIcon} alt="Google Icon" className="google-icon" />
      <span>Sign in with Google</span>
    </button>
  );
};

export default GoogleSignInButton;
