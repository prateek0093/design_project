import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    enrolledCourses: [],
    recentTasks: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          import.meta.env.VITE_BE_URL + "/verified/student/dashboard",
          {
            withCredentials: true,
          }
        );
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch dashboard data");
        setLoading(false);
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchDashboardData();
  }, []);

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

        <div className="p-4">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src="/api/placeholder/48/48"
              alt="Logo"
              className="w-12 h-12"
            />
            {isSidebarOpen && (
              <span className="font-bold text-xl">Leet Code</span>
            )}
          </div>

          <nav>
            {navItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className={`flex items-center space-x-3 p-3 rounded-lg mb-2 ${
                  item.active
                    ? "bg-purple-50 text-purple-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <img src={item.icon} alt="" className="w-6 h-6" />
                {isSidebarOpen && <span>{item.text}</span>}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Assignments */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Assignments</h2>
            </div>
            <div className="space-y-4">
              {dashboardData.recentTasks.map((task, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{task.assignmentName}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(task.startTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Course: {task.courseName} (ID: {task.courseId})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Enrolled Courses</h2>
            </div>

            <div className="space-y-4">
              {dashboardData.enrolledCourses.map((course) => (
                <Link
                  key={course.courseId}
                  to={`/course/${course.courseId}`} // Link to CoursePage with courseId
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {course.courseName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {course.courseCode}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Author: {course.authorName}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <button className="w-full mt-4 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
              View All Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
