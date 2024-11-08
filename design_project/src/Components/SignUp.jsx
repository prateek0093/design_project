import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import OTPDialog from "./OTPdialog";
import image from "/image.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const SignUp = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isOTPDialogOpen, setIsOTPDialogOpen] = useState(false);
  const [otpError, setOtpError] = useState("");
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const usernamePattern = /^[a-zA-Z0-9_-]{3,20}$/;
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

  const validateForm = () => {
    const newErrors = {};

    if (!emailPattern.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!usernamePattern.test(formData.username)) {
      newErrors.username =
        "Username must be 3-20 characters and can contain letters, numbers, underscore, and hyphen";
    }
    if (!passwordPattern.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters with at least one letter and one number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post(
          import.meta.env.VITE_BE_URL + "/signUp",
          formData
        );
        console.log("Registration successful:", response.data);

        setIsOTPDialogOpen(true);
      } catch (error) {
        console.error("Error during registration:", error);
      }
    }
  };

  const handleOTPClose = () => {
    setIsOTPDialogOpen(false);
  };

  const handleOTPSubmit = async (otpValue) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BE_URL + "/otpVerification",
        {
          otp: parseInt(otpValue),
          email: formData.email,
        }
      );
      console.log(response);
      if (response.data.success) {
        console.log("OTP verified successfully:", response.data);
        setIsOTPDialogOpen(false);
        navigate("/login");
      } else {
        setOtpError("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtpError("Error verifying OTP. Please try again.");
    }
  };
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-white max-w-[1920px] mx-auto overflow-hidden">
      <header className="flex justify-between items-center px-16 py-3 bg-white shadow-md h-[10vh]">
        <h1 className="text-2xl font-bold">
          <span className="text-purple-600">Leet</span>
          <span className="text-gray-400">Code</span>
        </h1>
        <nav className="flex gap-10 text-sm">
          <a
            href="#"
            className="text-gray-600 px-4 py-2 rounded-full hover:text-purple-600 hover:bg-purple-50 transition-all"
          >
            Practice
          </a>
          <a
            href="#"
            className="text-gray-600 px-4 py-2 rounded-full hover:text-purple-600 hover:bg-purple-50 transition-all"
          >
            Explore
          </a>
          <a
            href="#"
            className="text-gray-600 px-4 py-2 rounded-full hover:text-purple-600 hover:bg-purple-50 transition-all"
          >
            <Link
              to="/authorLogin"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Author
            </Link>
          </a>
          <a
            href="#"
            className="text-purple-600 px-4 py-2 rounded-full bg-purple-50"
          >
            <Link
              to="/signup"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Student
            </Link>
          </a>
        </nav>
      </header>

      <div className="flex h-[90vh]">
        <div className="w-3/5 flex justify-center items-center p-6">
          <div className="max-w-[500px] w-full">
            <img
              src="/image.png"
              alt="Person reading a book"
              className="w-full h-auto max-h-[65vh] object-contain rounded-2xl shadow-xl"
            />
          </div>
        </div>

        <div className="w-2/5 flex justify-center items-center p-6">
          <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-[400px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src={image} alt="LeetCode logo" className="w-7 h-7" />
              <h2 className="text-2xl font-bold">
                <span className="text-purple-600">Leet</span>
                <span className="text-gray-400">Code</span>
              </h2>
            </div>

            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Mail Id"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 border-2 rounded-xl text-sm transition-all focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 ${
                    errors.email ? "border-red-500" : "border-gray-200"
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
                    errors.username ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                )}
              </div>

              <div className="mb-4 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 border-2 rounded-xl text-sm transition-all focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
              <p
                onClick={() => navigate("/login")}
                className="text-purple-600 font-semibold"
                cursor-pointer
              >
                Log In
              </p>
            </div>
          </div>
        </div>
      </div>

      <OTPDialog
        isOpen={isOTPDialogOpen}
        onClose={() => {
          setOtpError("");
          setIsOTPDialogOpen(false);
        }}
        onSubmit={handleOTPSubmit}
      />
      {otpError && <p className="text-center text-red-500">{otpError}</p>}
    </div>
  );
};

export default SignUp;
