import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

const OTPDialog = ({ isOpen, onClose ,onSubmit}) => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) {
      setOtp(Array(6).fill(""));
    }
  }, [isOpen]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== "" && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");

    if (pastedData) {
      const updatedOtp = [...otp];
      pastedData.forEach((value, index) => {
        if (index < 6 && !isNaN(value)) {
          updatedOtp[index] = value;
          if (inputRefs.current[index]) {
            inputRefs.current[index].value = value;
          }
        }
      });
      setOtp(updatedOtp);

      const nextEmptyIndex = updatedOtp.findIndex((val) => val === "");
      if (
        nextEmptyIndex !== -1 &&
        nextEmptyIndex < 6 &&
        inputRefs.current[nextEmptyIndex]
      ) {
        inputRefs.current[nextEmptyIndex].focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    onSubmit(otpValue);
    console.log("OTP submitted:", otpValue);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white p-6 w-full max-w-md rounded-2xl shadow-2xl relative mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-center w-full">
            Enter OTP
          </h2>
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((data, index) => (
              <input
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                type="text"
                maxLength={1}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                className="w-12 h-12 text-center text-2xl font-semibold border-2 rounded-lg 
                         focus:border-purple-600 focus:ring-2 focus:ring-purple-100 
                         outline-none transition-all duration-200
                         sm:w-14 sm:h-14"
              />
            ))}
          </div>

          <p className="text-center text-gray-600 mb-6">
            Enter the 6-digit code sent to your email
          </p>

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white rounded-lg text-lg font-semibold
                     hover:bg-purple-700 transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPDialog;
