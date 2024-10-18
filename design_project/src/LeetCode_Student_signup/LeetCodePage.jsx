import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import OTPDialog from './OTPdialog';

const LeetCodePage = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isOTPDialogOpen, setIsOTPDialogOpen] = useState(false);

  // Validation patterns
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const usernamePattern = /^[a-zA-Z0-9_-]{3,20}$/;
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

  const validateForm = () => {
    const newErrors = {};

    if (!emailPattern.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!usernamePattern.test(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters and can contain letters, numbers, underscore, and hyphen';
    }
    if (!passwordPattern.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with at least one letter and one number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // If validation passes, open OTP dialog
      setIsOTPDialogOpen(true);
    }
  };

  const handleOTPClose = () => {
    setIsOTPDialogOpen(false);
  };

  const handleOTPSubmit = (otpValue) => {
    // Handle OTP verification here
    console.log('Verifying OTP:', otpValue);
    console.log('Form Data:', formData);
    // You would typically make an API call here
    setIsOTPDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-white max-w-[1920px] mx-auto overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-16 py-3 bg-white shadow-md h-[10vh]">
        <h1 className="text-2xl font-bold">
          <span className="text-purple-600">Leet</span>
          <span className="text-gray-400">Code</span>
        </h1>
        <nav className="flex gap-10 text-sm">
          <a href="#" className="text-gray-600 px-4 py-2 rounded-full hover:text-purple-600 hover:bg-purple-50 transition-all">
            Practice
          </a>
          <a href="#" className="text-gray-600 px-4 py-2 rounded-full hover:text-purple-600 hover:bg-purple-50 transition-all">
            Explore
          </a>
          <a href="#" className="text-gray-600 px-4 py-2 rounded-full hover:text-purple-600 hover:bg-purple-50 transition-all">
            Author
          </a>
          <a href="#" className="text-purple-600 px-4 py-2 rounded-full bg-purple-50">
            Student
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex h-[90vh]">
        {/* Left Side */}
        <div className="w-3/5 flex justify-center items-center p-6">
          <div className="max-w-[500px] w-full">
            <img
              src="/image.png"
              alt="Person reading a book"
              className="w-full h-auto max-h-[65vh] object-contain rounded-2xl shadow-xl"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="w-2/5 flex justify-center items-center p-6">
          <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-[400px] max-h-[80vh] overflow-y-auto">
            {/* Form Header */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <img
                src="/letter.png"
                alt="LeetCode logo"
                className="w-7 h-7"
              />
              <h2 className="text-2xl font-bold">
                <span className="text-purple-600">Leet</span>
                <span className="text-gray-400">Code</span>
              </h2>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Mail Id"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 border-2 rounded-xl text-sm transition-all focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 border-2 rounded-xl text-sm transition-all focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 ${
                    errors.username ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                )}
              </div>

              <div className="mb-4 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 border-2 rounded-xl text-sm transition-all focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 ${
                    errors.password ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3 px-3 rounded-full mt-4 mb-4 transform hover:-translate-y-0.5 transition-transform"
              >
                Register
              </button>
            </form>

            <div className="flex justify-between items-center text-xs my-6">
              <span>Have an Account?</span>
              <a href="#" className="text-purple-600 font-semibold">
                Log In
              </a>
            </div>

            <p className="text-center text-[10px] text-gray-500 mt-6">
              This site is protected by reCAPTCHA and the Google{" "}
              <a href="#" className="text-gray-500 underline">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="#" className="text-gray-500 underline">
                Terms of Service
              </a>{" "}
              apply.
            </p>
          </div>
        </div>
      </div>

      {/* OTP Dialog */}
      <OTPDialog 
        isOpen={isOTPDialogOpen} 
        onClose={handleOTPClose}
      />
    </div>
  );
};

export default LeetCodePage;
