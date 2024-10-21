import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import axios from "axios"; // Import axios
import aadmi from "/aadmi.png";

const LeetCodeLogin = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [formData, setFormData] = useState({ email: "", password: "" }); // State for form data
  const [error, setError] = useState({ email: "", password: "", general: "" }); // State for error messages

  // Regex patterns
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

  // Function to handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific error when the user starts typing
    setError((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  // Function to validate form inputs
  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    // Validate email
    if (!emailPattern.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
      isValid = false;
    }

    // Validate password
    if (!passwordPattern.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters, with one letter and one number.";
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  // Function to handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Make a POST request to the login API
        const response = await axios.post(
          "http://localhost:8080/login",
          formData
        );

        if (response.data.success) {
          console.log("Login successful", response.data);
          // Redirect to the landing page after successful login
          navigate("/landingpage");
        } else {
          // Handle login error if credentials are incorrect
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
            <span className="text-purple-500">Leet</span>
            <span className="text-gray-700">Code</span>
          </div>
          <nav className="space-x-4">
            <button className="text-gray-600 hover:text-gray-800">
              Practice
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              Explore
            </button>
            <button className="text-purple-500 hover:text-purple-600">
              Author
            </button>
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
                <span className="text-gray-700">Login</span>
              </span>
            </div>

            {/* General Error Message */}
            {error.general && (
              <p className="mb-4 text-red-500 text-center">{error.general}</p>
            )}

            {/* Login Form */}
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

              <div className="mb-6">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    error.password ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                {error.password && (
                  <p className="text-red-500 text-sm mt-1">{error.password}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition duration-300"
              >
                Login
              </button>
            </form>

            <div className="mt-4 flex justify-between items-center text-sm">
              <a href="#" className="text-gray-600 hover:text-gray-800">
                Forget Password?
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeetCodeLogin;
