import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aadmi from "/aadmi.png";
import { useCookies } from "react-cookie";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

// PasswordInput Component
const PasswordInput = ({ password, handleInputChange, error }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
      <div className="mb-6">
        <div className="relative flex items-center border rounded-md focus-within:ring-2 focus-within:ring-purple-500">
          {/* Password Input */}
          <input
              type={showPassword ? "text" : "password"} // Toggle input type
              name="password"
              placeholder="Password"
              value={password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-md focus:outline-none ${
                  error ? "border-red-500" : "border-gray-300"
              }`}
          />

          {/* Info Button for Password Requirements */}
          <button
              type="button"
              className="absolute right-10 p-1 text-gray-600 hover:text-gray-800"
              onClick={() =>
                  alert(
                      "Password must have at least 6 characters, 1 special character, and 1 uppercase letter."
                  )
              }
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20 10 10 0 010-20z"
              />
            </svg>
          </button>

          {/* Eye Icon to Show/Hide Password */}
          <button
              type="button"
              className="absolute right-3 p-1 text-gray-600 hover:text-gray-800"
              onClick={togglePasswordVisibility}
          >
            {showPassword ? (
                <EyeOff className="w-5 h-5" />
            ) : (
                <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
  );
};

// StudentLogin Component
const StudentLogin = () => {
  const navigate = useNavigate();
  const [cookie, setCookie] = useCookies(["accessToken"]);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState({ email: "", password: "", general: "" });

  const emailPattern = /^[a-zA-Z0-9._%+-]+@iiitvadodara\.ac\.in$/;
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!emailPattern.test(formData.email)) {
      newErrors.email = "Please use your @iiitvadodara.ac.in email address.";
      isValid = false;
    }

    if (!passwordPattern.test(formData.password)) {
      newErrors.password =
          "Password must be at least 6 characters, with one letter and one number.";
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (import.meta.env.VITE_BE_DEVSTAGE === "DEV" || validateForm()) {
      try {
        const response = await axios.post(
            `${import.meta.env.VITE_BE_URL}/login`,
            formData,
            { withCredentials: true }
        );

        if (response.data.success) {
          console.log("Login successful", response.data);
          const username = response.data.username;
          setCookie("accessToken", response.data.tokenString, {
            secure: false,
          });

          navigate("/studentDashboard", { state: { username } });
        } else {
          setError((prev) => ({
            ...prev,
            general: "Invalid email or password. Please try again.",
          }));
        }
      } catch (error) {
        console.error("Error during login:", error);
        setError((prev) => ({
          ...prev,
          general: "Something went wrong. Please try again later.",
        }));
      }
    }
  };

  return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <header className="w-full bg-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-2xl font-bold">
              <span className="text-purple-500">Code</span>
              <span className="text-gray-700">LAB</span>
            </div>
            <nav className="space-x-4">
              <Link
                  to="/authorLogin"
                  className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600"
              >
                Author
              </Link>
              <button className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600">
                Student
              </button>
            </nav>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-4">
          <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="w-1/2 p-8">
              <img
                  src={aadmi}
                  alt="Student reading a book"
                  className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="w-1/2 p-8">
              <div className="flex items-center justify-center mb-6">
              <span className="text-2xl font-bold">
                <span className="text-gray-700">Student Login</span>
              </span>
              </div>

              {error.general && (
                  <p className="mb-4 text-red-500 text-center">{error.general}</p>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <input
                      type="text"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                          error.email ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  {error.email && (
                      <p className="text-red-500 text-sm mt-1">{error.email}</p>
                  )}
                </div>

                {/* Use the PasswordInput component */}
                <PasswordInput
                    password={formData.password}
                    handleInputChange={handleInputChange}
                    error={error.password}
                />

                <button
                    type="submit"
                    className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition duration-300"
                >
                  Login
                </button>
              </form>

              <div className="flex justify-between items-center text-xs my-6">
                <p
                    onClick={() => navigate("/signup")}
                    className="text-xl text-purple-600 font-semibold hover:cursor-pointer"
                >
                  Sign Up
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
};

export default StudentLogin;
