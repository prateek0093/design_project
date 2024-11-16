import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { useCookies } from "react-cookie";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    enrolledCourses: [],
    recentTasks: [],
  });
  const [activeItem, setActiveItem] = useState("Dashboard");

  const [cookies] = useCookies(["accessToken"]);
  const navigate = useNavigate();

  // Redirect to login if no access token is found
  useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login"); // Navigate to login page if not logged in
    }
  }, [cookies.accessToken, navigate]);

  const fetchStudentDashboard = useCallback(async () => {
    try {
      const response = await fetch(
          import.meta.env.VITE_BE_URL + "/verified/student/dashboard",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${cookies.accessToken}`, // Send the token in the request header
            },
            credentials: "include", // Ensures cookies are sent with the request
          }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      console.log("Dashboard Data:", data);
      setDashboardData(data);
      setLoading(false);
    } catch (error) {
      setError("Error fetching dashboard data");
      setLoading(false);
    }
  }, [cookies.accessToken]);

  useEffect(() => {
    if (cookies.accessToken) {
      fetchStudentDashboard();
    }
  }, [cookies.accessToken, fetchStudentDashboard]);

  const navItems = [
    { icon: "/icons/dashboard.svg", text: "Dashboard" },
    { icon: "/icons/tests.svg", text: "Assignments" },
    { icon: "/icons/courses.svg", text: "Courses" },
    { icon: "/icons/dark-mode.svg", text: "Dark mode" },
  ];

  const handleCourseClick = (courseCode) => {
    navigate(`/enrolled/${courseCode}`);
  };

  if (loading || error) {
    return (
        <div className="flex h-screen items-center justify-center">
          <div className={`text-${error ? "red" : "purple"}-600`}>
            {error || "Loading dashboard..."}
          </div>
        </div>
    );
  }

  return (
      <div className="flex h-screen bg-neutral-100">
        {/* Sidebar */}
        <div
            className={`${
                isSidebarOpen ? "w-64" : "w-20"
            } bg-white transition-all duration-300 shadow-lg hidden md:block relative`}
        >
          <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="absolute -right-3 top-9 bg-purple-600 rounded-full p-1.5 text-white"
          >
            {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          <div className="p-5 flex items-center">
            {isSidebarOpen ? (
                <Link to="/studentDashboard" className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-purple-500">Code</span>
                  <span className="text-2xl font-bold text-purple-500">Lab</span>
                </Link>
            ) : (
                <Link
                    to="/studentDashboard"
                    className="text-2xl font-bold text-purple-500"
                >
                  CL
                </Link>
            )}
          </div>

          <div className="mt-10 space-y-3">
            {navItems.map((item, idx) => (
                <div
                    key={idx}
                    className={`${
                        activeItem === item.text ? "bg-purple-100" : ""
                    } flex items-center p-3 space-x-2 rounded-md cursor-pointer hover:bg-purple-100`}
                    onClick={() => setActiveItem(item.text)}
                >
                  <img
                      src={item.icon}
                      alt={item.text}
                      className="w-6 h-6 text-purple-600"
                  />
                  {isSidebarOpen && (
                      <span className="text-lg font-medium text-gray-600 truncate">
                  {item.text}
                </span>
                  )}
                </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow p-8 overflow-y-auto min-w-0">
          <h1 className="text-2xl font-bold text-purple-600">
            Student Dashboard
          </h1>

          <div className="mt-5">
            <h2 className="text-xl font-semibold text-gray-800">
              Enrolled Courses
            </h2>
            <ul className="mt-2 space-y-1">
              {dashboardData.enrolledCourses.map((course, index) => (
                  <li
                      key={index}
                      className="text-gray-600 truncate cursor-pointer hover:text-purple-600"
                      onClick={() => handleCourseClick(course.courseCode)}
                  >
                    {course.courseName} ({course.courseCode})
                  </li>
              ))}
            </ul>
          </div>

          <div className="mt-5">
            <h2 className="text-xl font-semibold text-gray-800">Recent Tasks</h2>
            <ul className="mt-2 space-y-1">
              {dashboardData.recentTasks.map((task, index) => (
                  <li key={index} className="text-gray-600 truncate">
                    {task.assignmentName} -{" "}
                    {new Date(task.startTime).toLocaleString()}
                  </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;
