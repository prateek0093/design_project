import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import axios from 'axios';
import React from 'react';

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    enrolledUsers: [],
    recentTests: [],
    stats: {
      testsWritten: 0,
      overallAverage: 0,
      testStats: {
        total: 0,
        passed: 0,
        failed: 0,
        pending: 0
      }
    }
  });

  // Replace these API endpoints with your actual endpoints
  const API_ENDPOINTS = {
    DASHBOARD: 'https://api.yourbackend.com/dashboard',
    USERS: 'https://api.yourbackend.com/users',
    TESTS: 'https://api.yourbackend.com/tests',
    STATS: 'https://api.yourbackend.com/stats'
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // You can replace this with your actual API endpoint
        const response = await axios.get(API_ENDPOINTS.DASHBOARD);
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        setLoading(false);
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, []);

  const navItems = [
    { icon: "/icons/dashboard.svg", text: "Dashboard", active: true },
    { icon: "/icons/tests.svg", text: "Tests" },
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
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white transition-all duration-300 shadow-lg hidden md:block relative`}>
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-9 bg-purple-600 rounded-full p-1.5 text-white"
        >
          {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
        
        <div className="p-4">
          <div className="flex items-center space-x-4 mb-6">
            <img src="/api/placeholder/48/48" alt="Logo" className="w-12 h-12" />
            {isSidebarOpen && <span className="font-bold text-xl">Leet Code</span>}
          </div>
          
          <nav>
            {navItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className={`flex items-center space-x-3 p-3 rounded-lg mb-2 ${
                  item.active 
                    ? 'bg-purple-50 text-purple-600' 
                    : 'text-gray-600 hover:bg-gray-50'
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
          {/* Recent Tests */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Tests</h2>
              <button className="text-purple-600 hover:text-purple-700">Add Test</button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentTests.map((test, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{test.title}</span>
                    <span className="text-sm text-gray-500">{test.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${test.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courses Enrolled */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Courses Enrolled</h2>
              <div className="flex space-x-2">
                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <img src="/icons/prev.svg" alt="Previous" className="w-5 h-5" />
                </button>
                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <img src="/icons/next.svg" alt="Next" className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Enrolled Users List */}
            <div className="space-y-4">
              {dashboardData.enrolledUsers.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="relative">
                    <img 
                      src={user.avatar}
                      alt={user.name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-100"
                    />
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">{user.name}</h3>
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                          user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {user.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="truncate">{user.course}</span>
                      <span className="mx-2">•</span>
                      <span className="text-xs">{user.lastActive}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
              View All Enrolled Users
            </button>
          </div>

          {/* Statistics */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-6">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold">{dashboardData.stats.testsWritten}</div>
                <div className="text-sm text-gray-500">Tests Written</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold">{dashboardData.stats.overallAverage}%</div>
                <div className="text-sm text-gray-500">Overall Average</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              <StatsBox label="Total" value={dashboardData.stats.testStats.total} />
              <StatsBox label="Passed" value={dashboardData.stats.testStats.passed} />
              <StatsBox label="Failed" value={dashboardData.stats.testStats.failed} />
              <StatsBox label="Pending" value={dashboardData.stats.testStats.pending} />
            </div>
          </div>

          {/* Upcoming Tests */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-6">Upcoming Assignments</h2>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-100 rounded-full mb-4" />
              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-full hover:opacity-90">
                Remind Me
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsBox = ({ label, value }) => (
  <div className="text-center">
    <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
      <span className="text-lg font-bold">{value}</span>
    </div>
    <div className="text-xs text-gray-500">{label}</div>
  </div>
);

export default Dashboard;