import React from 'react';
import './TermsAndConditionsModal.css';

const SignUpTermsModal = ({ open, agreed, onAgree, onClose }) => {
  if (!open) return null;

  return (
    <div className="terms-modal-overlay">
      <div className="terms-modal">
        <h2>Terms and Conditions</h2>
        <div className="terms-content">
          <p>Welcome to SignEase! Please read these terms and conditions carefully before using our service.</p>
          
          <h3>1. Acceptance of Terms</h3>
          <p>By accessing and using SignEase, you agree to be bound by these Terms and Conditions.</p>
          
          <h3>2. User Responsibilities</h3>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate and complete information during registration</li>
            <li>Maintain the security of your account</li>
            <li>Use the service in compliance with all applicable laws</li>
          </ul>
          
          <h3>3. Privacy Policy</h3>
          <p>Your use of SignEase is also governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>
          
          <h3>4. Service Usage</h3>
          <p>SignEase provides sign language translation services. We strive for accuracy but cannot guarantee perfect translations.</p>
          
          <h3>5. Account Security</h3>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
        </div>
        
        <div className="terms-agreement">
          <input
            type="checkbox"
            id="agree-terms"
            checked={agreed}
            onChange={onAgree}
          />
          <label htmlFor="agree-terms">
            I have read and agree to the Terms and Conditions
            
          </label>
        </div>
        
        <button 
          className="tc-continue-btn"
          onClick={onClose}
          disabled={!agreed}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SignUpTermsModal; 