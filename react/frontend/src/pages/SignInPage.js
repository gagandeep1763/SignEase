import React, { useState } from 'react';
import '../styles/Signin.css'; 
import signupImage from '../assets/sign-up.png';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import GoogleSignInButton from '../components/GoogleSignInButton';
import TermsAndConditionsModal from '../components/TermsAndConditionsModal';
import { getAuth, sendEmailVerification } from "firebase/auth"; 

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from AuthContext
  const auth = getAuth(); // Get auth instance

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true);
    setVerificationSent(false); 

    try {
      const userCredential = await login(email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError('Please verify your email address. Check your inbox for a verification link.');
        setLoading(false);
        return;
      }

      if (localStorage.getItem('signease_terms_agreed') === 'true') {
        navigate('/home');
      } else {
        setShowTermsModal(true);
      }
    } catch (firebaseError) {
      let errorMessage = 'Failed to sign in.';
      if (firebaseError.code === 'auth/invalid-email' || firebaseError.code === 'auth/user-not-found') {
        errorMessage = 'Invalid email or user not found.';
      } else if (firebaseError.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (firebaseError.code === 'auth/too-many-requests') {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (firebaseError.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.';
      } else if (firebaseError.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'This email is already registered with Google Sign-In. Please use Google Sign-In instead.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInSuccess = (user) => {
    if (!user.emailVerified) {
      setError('Please verify your email address. Check your inbox for a verification link.');
      // For Google sign-in, Firebase usually handles verification automatically on first sign-in.
      // This case might be rare, but it'll be good to handle.
      return;
    }
    setShowTermsModal(true);
  };

  const handleResendVerification = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setVerificationSent(true);
        setError('Verification email sent! Please check your inbox.');
      } else {
        setError('No user logged in to resend verification email.');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      setError('Failed to resend verification email. Please try again later.');
    }
  };

  const handleAgree = () => setAgreedToTerms(!agreedToTerms);

  const handleCloseModal = () => {
    setShowTermsModal(false);
    setAgreedToTerms(false);
    localStorage.setItem('signease_terms_agreed', 'true');
    navigate('/home');
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

      <div className="signin-right">
        <h2 className="signin-title">Let's Sign you in</h2>
        <p className="signin-subtitle">Welcome Back, You have been missed</p>
        {error && <div className="error-alert" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>} {/* Display errors */}
        {error && error.includes('Please verify your email address') && !verificationSent && (
          <button onClick={handleResendVerification} className="resend-verification-btn" disabled={loading}>
            Resend Verification Email
          </button>
        )}
        <form className="signin-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email or username"
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
          
          <button type="submit" className="signin-button" disabled={loading}>Sign in</button> {/* Disable button during loading */}
        </form>
        <div className="divider">
          <span>or</span>
        </div>
        <div className="social-buttons">
          <GoogleSignInButton onSuccess={handleGoogleSignInSuccess} />
        </div>
        <p className="register-link">
          Don't have an account? <Link to="/signup">Register Now</Link>
        </p>
      </div>
      <TermsAndConditionsModal
        open={showTermsModal}
        agreed={agreedToTerms}
        onAgree={handleAgree}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default SignInPage;