import { useState, useEffect, useCallback } from "react";
import { Menu, X, BookOpen, Clock, ChevronRight } from "lucide-react";
import { useCookies } from "react-cookie";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./header.jsx";

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

  useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies.accessToken, navigate]);

  const fetchStudentDashboard = useCallback(async () => {
    try {
      const response = await fetch(
          import.meta.env.VITE_BE_URL + "/verified/student/dashboard",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${cookies.accessToken}`,
            },
            credentials: "include",
          }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData({
        enrolledCourses: data.enrolledCourses || [],
        recentTasks: data.recentTasks || [],
      });
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
    { text: "Dashboard" },
    { text: "Assignments" },
    { text: "Courses" },
    { text: "Dark mode" },
  ];

  const handleCourseClick = (courseCode) => {
    navigate(`/enrolled/${courseCode}`);
  };

  const handleTaskClick = (courseCode, assignmentId) => {
    navigate(`/enrolled/${courseCode}/${assignmentId}`);
  };

  if (loading || error) {
    return (
        <div className="flex h-screen items-center justify-center">
          <div
              className={`text-${
                  error ? "red" : "purple"
              }-600 flex flex-col items-center gap-4`}
          >
            {error ? (
                <>
                  <div className="text-xl font-semibold">{error}</div>
                  <button
                      onClick={fetchStudentDashboard}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Retry
                  </button>
                </>
            ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <div className="text-lg">Loading dashboard...</div>
                </div>
            )}
          </div>
        </div>
    );
  }

  return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Header />
        <div className="flex flex-grow">
          {/* Sidebar */}
          <div
              className={`${
                  isSidebarOpen ? "w-64" : "w-20"
              } bg-white transition-all duration-300 shadow-lg hidden md:block relative`}
          >
            <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="absolute -right-3 top-9 bg-purple-600 rounded-full p-1.5 text-white hover:bg-purple-700 transition-colors"
            >
              {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            <div className="p-5 flex items-center">
              {isSidebarOpen ? (
                  <Link
                      to="/studentDashboard"
                      className="flex items-center space-x-2"
                  >
                    <span className="text-2xl font-bold text-purple-600">Code</span>
                    <span className="text-2xl font-bold text-purple-600">Lab</span>
                  </Link>
              ) : (
                  <Link
                      to="/studentDashboard"
                      className="text-2xl font-bold text-purple-600"
                  >
                    CL
                  </Link>
              )}
            </div>

            <div className="mt-10 space-y-2 px-3">
              {navItems.map((item, idx) => (
                  <div
                      key={idx}
                      className={`${
                          activeItem === item.text
                              ? "bg-purple-100 text-purple-600"
                              : "text-gray-600 hover:bg-purple-50"
                      } flex items-center p-3 space-x-3 rounded-lg cursor-pointer transition-colors duration-200`}
                      onClick={() => setActiveItem(item.text)}
                  >
                    {isSidebarOpen && (
                        <span className="font-medium truncate">{item.text}</span>
                    )}
                  </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow p-8 overflow-y-auto min-w-0">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-800 mb-8">
                Welcome to your Dashboard
              </h1>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Enrolled Courses Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Enrolled Courses
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {dashboardData.enrolledCourses.length > 0 ? (
                        dashboardData.enrolledCourses.map((course, index) => (
                            <div
                                key={index}
                                onClick={() => handleCourseClick(course.courseCode)}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors group"
                            >
                              <div>
                                <h3 className="font-medium text-gray-800">
                                  {course.courseName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {course.courseCode}
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No courses enrolled yet.</p>
                    )}
                  </div>
                </div>

                {/* Recent Tasks Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Recent Tasks
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {dashboardData.recentTasks.length > 0 ? (
                        dashboardData.recentTasks.map((task, index) => (
                            <div
                                key={index}
                                onClick={() =>
                                    handleTaskClick(task.courseCode, task.assignmentId)
                                }
                                className="flex flex-col p-3 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors">
                                  {task.assignmentName}
                                </h3>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {task.courseCode}
                          </span>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-500">
                            {new Date(task.startTime).toLocaleString()}
                          </span>
                              </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No recent tasks yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;
