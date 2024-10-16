import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import OTPDialog from './OTPdialog';
import './LeetCodePage.css';

const LeetCodePage = () => {
  const [isOTPDialogOpen, setIsOTPDialogOpen] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    setIsOTPDialogOpen(true);
  };

  return (
    <div className="leetcode-page">
      <header className="header">
        <h1 className="logo">
          <span className="leet">Leet</span>
          <span className="code">Code</span>
        </h1>
        <nav className="nav">
          <a href="#" className="nav-link">Practice</a>
          <a href="#" className="nav-link">Explore</a>
          <a href="#" className="nav-link">Author</a>
          <a href="#" className="nav-link active">Student</a>
        </nav>
      </header>

      <div className="content-container">
        <div className="left-side">
          <div className="main-content">
            <img
              src="/image.png"
              alt="Person reading a book"
              className="main-image"
            />
          </div>
        </div>

        <div className="right-side">
          <div className="registration-form">
            <div className="form-header">
              <img
                src="/letter.png"
                alt="LeetCode logo"
                className="social-icon"
              />
              <h2 className="form-title">
                <span className="leet">Leet</span>
                <span className="code">Code</span>
              </h2>
            </div>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Mail Id"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Username"
                  className="form-input"
                />
              </div>
              <div className="form-group password-group">
                <input
                  type="password"
                  placeholder="Password"
                  className="form-input"
                />
                <Eye className="password-icon" size={20} />
              </div>
              <button type="submit" className="register-button">
                Register
              </button>
            </form>

            <div className="login-prompt">
              <span>Have an Account?</span>
              <a href="#" className="login-link">Log In</a>
            </div>

            <div className="recaptcha-notice">
              This site is protected by reCAPTCHA and the Google{" "}
              <a href="#" className="policy-link">Privacy Policy</a> and{" "}
              <a href="#" className="policy-link">Terms of Service</a> apply.
            </div>
          </div>
        </div>
      </div>

      <OTPDialog 
        isOpen={isOTPDialogOpen} 
        onClose={() => setIsOTPDialogOpen(false)} 
      />
    </div>
  );
};

export default LeetCodePage;