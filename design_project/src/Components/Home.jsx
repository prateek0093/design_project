import React from "react";
import { Link, useNavigate } from "react-router-dom";
import aadmi from "/aadmi.png";
const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-br from-purple-100 to-purple-200 min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-purple-600">Leet Code</h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a href="#" className="text-gray-600 hover:text-purple-600">
                  Practice
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-purple-600">
                  Explore
                </a>
              </li>
              <li>
                <Link
                  // CHANGE: /autherLogin
                  to="/profDashboard/addAssignment/:5"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Author
                </Link>
              </li>
              <li>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition"
                >
                  <Link
                    to="/signup"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    Student
                  </Link>
                </button>
              </li>
            </ul>
          </nav>
        </header>
        <main className="flex items-center">
          <div className="w-1/2 pr-8 ml-48">
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-purple-600">A New Way To</span>
              <br />
              <span className="text-gray-800">Learn</span>
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Our Platform Is Designed To Sharpen Your Problem-Solving Skills,
              Broaden Your Understanding, And Prepare You For Coding
              Assessments.
            </p>
            <div className="space-x-4">
              <button className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 transition">
                Courses
              </button>
              <button className="bg-white text-purple-500 px-6 py-3 rounded-full hover:bg-gray-100 transition border border-purple-500">
                Test
              </button>
            </div>
          </div>
          <div className="w-1/2">
            <img
              src={aadmi}
              alt="Student reading a book"
              className="rounded-lg"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
