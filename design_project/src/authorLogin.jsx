import React from "react";
import aadmi from "/aadmi.png";
const LeetCodeLogin = () => {
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
                <span className="text-purple-500"></span>
                <span className="text-gray-700">Login</span>
              </span>
            </div>

            <form>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="mb-6">
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
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
