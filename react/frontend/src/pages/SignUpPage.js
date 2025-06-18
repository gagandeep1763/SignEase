import React, { useState } from 'react';
import '../styles/Signup.css';
import { Link, useNavigate } from 'react-router-dom';
import signupImage from '../assets/sign-up.png';
import SignUpTermsModal from '../components/SignUpTermsModal';
import { useAuth } from '../context/AuthContext';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();

    setError('');
    setSuccessMessage('');
    setLoading(true);

    const gmailRegex = /^[\w\.-]+@(gmail|googlemail)\.com$/;
    if (!gmailRegex.test(email)) {
      setError('Only Gmail accounts are allowed for registration.');
      setLoading(false);
      return;
    }

    try {
      await signup(email, password);
      setShowTermsModal(true);
      setSuccessMessage('Account created! Please verify your email before logging in.');
    } catch (firebaseError) {
      let errorMessage = 'Failed to create an account.';
      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'The email address is already in use by another account.';
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAgree = () => setAgreedToTerms(!agreedToTerms);

  const handleCloseModal = () => {
    setShowTermsModal(false);
    setAgreedToTerms(false);
    localStorage.setItem('signease_terms_agreed', 'true');
    navigate('/'); // Redirecting to sign-in page
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
          <h2>Let's Register Account</h2>
          <p>Hello user, you have a greatful journey</p>
          {error && <div className="error-alert" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          {successMessage && <div style={{ color: 'green', marginBottom: '10px' }}>{successMessage}</div>}
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
            <button type="submit" disabled={loading}>Signup</button>
          </form>
          <p className="login-link">
            Already have an account? <Link to="/">Login</Link>
          </p>
        </div>
      </div>
      <SignUpTermsModal
        open={showTermsModal}
        agreed={agreedToTerms}
        onAgree={handleAgree}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default SignUpPage;