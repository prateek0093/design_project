import React, { useState } from 'react';
import { X } from 'lucide-react';
import './OTPDialog.css';
const OTPDialog = ({ isOpen, onClose }) => {
  const [otp, setOtp] = useState(Array(6).fill(''));

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp.map((d, idx) => (idx === index ? element.value : d))];
    setOtp(newOtp);

    if (element.nextSibling) {
      element.nextSibling.focus();
    }

    setOtp(newOtp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    console.log('OTP submitted:', otpValue);
    onClose();
  };

  return (
    <div className={`dialog-backdrop ${isOpen ? 'open' : ''}`}>
      <div className="dialog-content">
        <div className="dialog-header">
          <h2 className="dialog-title">Enter OTP</h2>
          <button className="close-button" onClick={onClose}>
            <X className="icon" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="otp-input-container">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}
                className="otp-input"
              />
            ))}
          </div>
          <p className="info-text">
            Enter the 6-digit code sent to your email
          </p>
          <button type="submit" className="submit-button">
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPDialog;
