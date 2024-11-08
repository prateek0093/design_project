import { useState, useEffect } from "react";
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

  const [cookies] = useCookies(["accessToken"]);
  const navigate = useNavigate();

  // Redirect to login if no access token is found
  useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login"); // Navigate to login page if not logged in
    }
  }, [cookies, navigate]);

  const fetchStudentDashboard = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_BE_URL + '/verified/student/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cookies.accessToken}`, // Send the token in the request header
        },
        credentials: 'include', // Ensures cookies are sent with the request
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      console.log('Dashboard Data:', data);

      setDashboardData({
        enrolledCourses: data.enrolledCourses || [],
        recentTasks: data.recentTasks || [],
      });
      setLoading(false);
    } catch (error) {
      setError('Error fetching dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cookies.accessToken) {
      fetchStudentDashboard();
    }
  }, [cookies]);

  const navItems = [
    { icon: "/icons/dashboard.svg", text: "Dashboard", active: true },
    { icon: "/icons/tests.svg", text: "Assignments" },
    { icon: "/icons/courses.svg", text: "Courses" },
    { icon: "/icons/profile.svg", text: "Profile" },
    { icon: "/icons/leaderboard.svg", text: "Leaderboard" },
    { icon: "/icons/dark-mode.svg", text: "Dark mode" },
  ];

  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-purple-600">Loading dashboard...</div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-red-600">{error}</div>
        </div>
    );
  }

  return (
      <div className="flex h-screen bg-neutral-100">
        {/* Sidebar */}
        <div
            className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white transition-all duration-300 shadow-lg hidden md:block relative`}
        >
          <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="absolute -right-3 top-9 bg-purple-600 rounded-full p-1.5 text-white"
          >
            {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          <div className="p-5">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-purple-500">Leet</span>
              <span className="text-xl text-gray-700">Code</span>
            </Link>
          </div>

          <div className="mt-10 space-y-3">
            {navItems.map((item, idx) => (
                <div
                    key={idx}
                    className={`${item.active ? "bg-purple-100" : ""} flex items-center p-3 space-x-2 rounded-md cursor-pointer hover:bg-purple-100`}
                >
                  <img
                      src={item.icon}
                      alt={item.text}
                      className="w-6 h-6 text-purple-600"
                  />
                  <span className="text-lg font-medium text-gray-600">{item.text}</span>
                </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold text-purple-600">Student Dashboard</h1>

          <div className="mt-5">
            <h2 className="text-xl font-semibold text-gray-800">Enrolled Courses</h2>
            <ul className="mt-2">
              {dashboardData.enrolledCourses && dashboardData.enrolledCourses.length > 0 ? (
                  dashboardData.enrolledCourses.map((course, index) => (
                      <li key={index} className="text-gray-600">
                        <strong>{course.courseName || "Unnamed Course"}</strong> - {course.courseId || "No ID"} <br />
                        Code: {course.courseCode || "No Code"} <br />
                        Author: {course.authorName || "No Author"}
                      </li>
                  ))
              ) : (
                  <li className="text-gray-600">No enrolled courses</li>
              )}
            </ul>
          </div>

          <div className="mt-5">
            <h2 className="text-xl font-semibold text-gray-800">Recent Tasks</h2>
            <ul className="mt-2">
              {dashboardData.recentTasks && dashboardData.recentTasks.length > 0 ? (
                  dashboardData.recentTasks.map((task, index) => (
                      <li key={index} className="text-gray-600">
                        <strong>{task.assignmentName || "Unnamed Task"}</strong> for Course: {task.courseName || "No Course"} <br />
                        Task ID: {task.courseId || "No ID"} <br />
                        Start Time: {task.startTime || "No Start Time"}
                      </li>
                  ))
              ) : (
                  <li className="text-gray-600">No recent tasks</li>
              )}
            </ul>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;
