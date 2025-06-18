import React from 'react';
import { auth, provider } from '../firebase/config';
import { signInWithPopup } from 'firebase/auth';
import GoogleIcon from '../assets/google-icon.png';
import './GoogleSignInButton.css';

const GoogleSignInButton = ({ onSuccess }) => {
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      
      if (onSuccess) onSuccess(result.user);
      
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button className="google-signin-button" onClick={handleGoogleSignIn}>
      <img src={GoogleIcon} alt="Google Icon" className="google-icon" />
      Sign up using Google
    </button>
  );
};

export default GoogleSignInButton;