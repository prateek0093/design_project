import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import React from 'react';

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  

  const enrolledUsers = [
    {
      id: 1,
      name: "John Doe",
      avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAADACAMAAAB/Pny7AAAAnFBMVEX///8AESEAAACxtrv///38/Pz+/f8AEiACEiMAABUAABcAAA4AABEACx0DFCP09PUAAAbc3+EAESVhZGkAABpHSk5/gofIycvU1tjt8PNERUq5vL+Mj5Rvc3k/QkqgpamWmp4ACCBBR1MfIi0qLjkmKzFRU1gCChgXGylLT1oxNUBXWmM2Oj1bXmBnbHFtcn8uLy8aGx0SFh4QGCuObso/AAAHWElEQVR4nO2cC3eiPBCGk0AgiAHiDRAQu9661vrtdv//f/smuL2s2gq0hPScPHuOtZfj5jUzk8lkIkIGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBi6wnGobcMX+cyWz2jfI/oEIMW2QQqSQuQjfHWcngfVDhi2bdMwTDILyEQY0u8rBiHQkS84ORHx7TIWYd9jagFMARXZbE/IcMKY62I84hNQNF3Gqfztt5kf6lBqI1E+EDLADL/C2GhI/CJLkXShkx/pjg1SaDYe+hjLKXkLw8GOrGaxjAzfIrI5clpmG8JH+IIA9I04mS9D9E0szUHx2OdMjvwSBnbHhnczAdbY90BvYFP5fmfzIb8m5GRo8oF7j8lpTe17xB8Ank/t7OC/J+V1fqJHAWFAa7+BpAXF90PGaqjZSjU6mxrMTHIg7LYYMDdyFFpbGZAeCcPMvaXFBUge2jrPjE1zciUiX4eTzNF6amJyd9vEni3Nn6d9j/cjwi2p4S8vakje94A/IiOj+lpczIei7xG/A2wm0dxn+KbzvxAw8h9COoZnuQLG9b1fWhl2uZ/KPKDvsV8AYmgxxBjXtzMccGLpODGSdM+vZ5fvTQ13vUeqY/oMxmKt3s0vr8KZy38JHasCMKTZpJGWSs/vUs8tZzhuLgbvZnqKEVOvuZjJUUcxNkrmbcRsdUxpYCNzaOb/JzFTHZMAG2W/Wojx5knfI7+KtWkpRr/QDFlmWzH6QdubmX4zAwFgv2su5k7LAIAgNLcQM3g8VZ51Q2wHzcVMCh0XTRjTuMWiucv1FIPy5mL470xTMXHT2Mzw5JDqqAXEpPOGaXOAvcLRUwzYWcSabJtdzEimZSxDlKKENCgASDhB+p4//yBB/UoTZows+x7xBySkgRbIZVZan6QXpL4UFxOr7/F+iFgN6xfOyUOoX/3vFdsun+Rac/vkLMB4eIi1PgekKJxJQ7tZpQUxuyeLarnGPOMgWxSE3S5ruphHeah3Z4NcMpKtf7tI6/LdDBIZqrMYSh3HTrbkZo7GSSF07wOQ2LYYg9+4TJ7CnqlyXflDNrojMC99D7QmaUEmjFeucUnAmE9K2czR9zBrIBsAkfVE/jr6BaMJgZisb0r2D07lCmmxGXpXXId7T4cllf2O38LMqh4SeIiL+b034FWmX/VsQDj2BptpnlT9dVpuMD8gWR4Xd74f+R7gR5F3Py1KPStLdUjjMi8efy4Wi+l2XORWomPJvx6VW9BUJHEcJ4lIqYzbOi+TH1GJeROzIBrTbyTGkTkAQqFsLpdNgY7tvETgqmOWVm1c4PtyVwZRQOvwLJOttBxD8JX9wBfTIO8GVHKX4zI9adMXePfTfBV50UbuIe2Ld945mZ61gT9Z5anmNx3SGSEerCoD4ubCQed1JPg2FLlLBvAnnJBc5zgdlityN5Ip5gjkRA+lSMPXLJ/SMBXlQwR528jFgcvuyKbUr6JBpX+gMP5BJq87GfnWkz/F0ooTASSxtSz+yPsNr3vqYEJ+xDJaUI02NvKmDxXLVXS292fYA0F8td7v1yupbYD/6a1jAYtWS4FOQUET5PKRjf3BmZYAVzkZ5wOA8+oH57WO0cAfZ9TWqPPUscNyQUZV0+ybwcJWDN57VzbTutKR4JuL3joXrHFRUj3Cmgy/1Baz1fByoJUlsb+W9fLkTAz8xtvMUnk1oPc8uipKiCPhTRrNzgjc6CiqVbZnMdVGbD1s0Jl5DXe41uGcFhxXgJbgExMDfsP4cJ+i3uMz2Nh+UFVc2ovhjAXu4NBvOkCl1yYH/3Mm9jw9/qHq1ehrduS6L8be7WsMtcRgbyz6LEBRWSFr0TBzjUBWOXs8eqYozHc8CBoeZF4Hltzdbhn2ssWByAM5jLXxgqtrYQsxMDnexpLXIlX7zSnNTfb1z8nqwPx98vLiasXQcNz0qPymGjIOUQ9TA//yBqexNcVgkqvXIn0m/apA9kYM5NDqMwFZLVpEX61FEi2qF1crBllf7TAnGLFU7wXAyDYtOv/rMNmkip3GRrnfycTI+LxUvRsQh0lXYpTnz07+9Mn92Lu4+ClXmG3KjfL2vBTzdTBvK5SFZ7molfzL15hnAu7yUuXKmR4jt0mbXBN44PpHZSdskNhm6xb92PUZrNU1CNvh12dl/yJv16sRY6Nk2tUic4L500RZFpBda1f4SvhAWYtwmHeSYr6B+bmqgxuxvfnxJZ8Ws1WVBcQ73qnLAHwXq9FCy26S/7cwUqpZNMOCdJWXPeNiUqhxmnThN7n03waG/YWaJCC57zgwS/i9miuPFgncrmfGDdS01tNl5y5TOc1SRQSguRoxuRIxMxJ0HwACMlM2M537jKKZQVmkQkyUqdCCxM8mH8jUTgwjP9UkZzSeE48z+VmfXSC7tzwyj9WkM5Qm+Zp0yjpPFJVnbIpomsRWZ8RJSpGqdo3ney+d/HenD0NWdudJSrHtzs4dTi/dfyONwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAzfj/8BEKltmnQKF/0AAAAASUVORK5CYII=",
      course: "Python Programming",
      status: "active",
      isOnline: true,
      lastActive: "2 hours ago"
    },
    {
      id: 2,
      name: "Jane Smith",
      avatar: "data:image/png;base64,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",
      course: "Web Development",
      status: "pending",
      isOnline: false,
      lastActive: "5 hours ago"
    },
    {
      id: 3,
      name: "Mike Johnson",
      avatar: "data:image/png;base64,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",
      course: "Data Science",
      status: "active",
      isOnline: true,
      lastActive: "1 hour ago"
    },
    {
      id: 4,
      name: "Sarah Williams",
      avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAADACAMAAAB/Pny7AAAAnFBMVEX///8AESEAAACxtrv///38/Pz+/f8AEiACEiMAABUAABcAAA4AABEACx0DFCP09PUAAAbc3+EAESVhZGkAABpHSk5/gofIycvU1tjt8PNERUq5vL+Mj5Rvc3k/QkqgpamWmp4ACCBBR1MfIi0qLjkmKzFRU1gCChgXGylLT1oxNUBXWmM2Oj1bXmBnbHFtcn8uLy8aGx0SFh4QGCuObso/AAAHWElEQVR4nO2cC3eiPBCGk0AgiAHiDRAQu9661vrtdv//f/smuL2s2gq0hPScPHuOtZfj5jUzk8lkIkIGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBi6wnGobcMX+cyWz2jfI/oEIMW2QQqSQuQjfHWcngfVDhi2bdMwTDILyEQY0u8rBiHQkS84ORHx7TIWYd9jagFMARXZbE/IcMKY62I84hNQNF3Gqfztt5kf6lBqI1E+EDLADL/C2GhI/CJLkXShkx/pjg1SaDYe+hjLKXkLw8GOrGaxjAzfIrI5clpmG8JH+IIA9I04mS9D9E0szUHx2OdMjvwSBnbHhnczAdbY90BvYFP5fmfzIb8m5GRo8oF7j8lpTe17xB8Ank/t7OC/J+V1fqJHAWFAa7+BpAXF90PGaqjZSjU6mxrMTHIg7LYYMDdyFFpbGZAeCcPMvaXFBUge2jrPjE1zciUiX4eTzNF6amJyd9vEni3Nn6d9j/cjwi2p4S8vakje94A/IiOj+lpczIei7xG/A2wm0dxn+KbzvxAw8h9COoZnuQLG9b1fWhl2uZ/KPKDvsV8AYmgxxBjXtzMccGLpODGSdM+vZ5fvTQ13vUeqY/oMxmKt3s0vr8KZy38JHasCMKTZpJGWSs/vUs8tZzhuLgbvZnqKEVOvuZjJUUcxNkrmbcRsdUxpYCNzaOb/JzFTHZMAG2W/Wojx5knfI7+KtWkpRr/QDFlmWzH6QdubmX4zAwFgv2su5k7LAIAgNLcQM3g8VZ51Q2wHzcVMCh0XTRjTuMWiucv1FIPy5mL470xTMXHT2Mzw5JDqqAXEpPOGaXOAvcLRUwzYWcSabJtdzEimZSxDlKKENCgASDhB+p4//yBB/UoTZows+x7xBySkgRbIZVZan6QXpL4UFxOr7/F+iFgN6xfOyUOoX/3vFdsun+Rac/vkLMB4eIi1PgekKJxJQ7tZpQUxuyeLarnGPOMgWxSE3S5ruphHeah3Z4NcMpKtf7tI6/LdDBIZqrMYSh3HTrbkZo7GSSF07wOQ2LYYg9+4TJ7CnqlyXflDNrojMC99D7QmaUEmjFeucUnAmE9K2czR9zBrIBsAkfVE/jr6BaMJgZisb0r2D07lCmmxGXpXXId7T4cllf2O38LMqh4SeIiL+b034FWmX/VsQDj2BptpnlT9dVpuMD8gWR4Xd74f+R7gR5F3Py1KPStLdUjjMi8efy4Wi+l2XORWomPJvx6VW9BUJHEcJ4lIqYzbOi+TH1GJeROzIBrTbyTGkTkAQqFsLpdNgY7tvETgqmOWVm1c4PtyVwZRQOvwLJOttBxD8JX9wBfTIO8GVHKX4zI9adMXePfTfBV50UbuIe2Ld945mZ61gT9Z5anmNx3SGSEerCoD4ubCQed1JPg2FLlLBvAnnJBc5zgdlityN5Ip5gjkRA+lSMPXLJ/SMBXlQwR528jFgcvuyKbUr6JBpX+gMP5BJq87GfnWkz/F0ooTASSxtSz+yPsNr3vqYEJ+xDJaUI02NvKmDxXLVXS292fYA0F8td7v1yupbYD/6a1jAYtWS4FOQUET5PKRjf3BmZYAVzkZ5wOA8+oH57WO0cAfZ9TWqPPUscNyQUZV0+ybwcJWDN57VzbTutKR4JuL3joXrHFRUj3Cmgy/1Baz1fByoJUlsb+W9fLkTAz8xtvMUnk1oPc8uipKiCPhTRrNzgjc6CiqVbZnMdVGbD1s0Jl5DXe41uGcFhxXgJbgExMDfsP4cJ+i3uMz2Nh+UFVc2ovhjAXu4NBvOkCl1yYH/3Mm9jw9/qHq1ehrduS6L8be7WsMtcRgbyz6LEBRWSFr0TBzjUBWOXs8eqYozHc8CBoeZF4Hltzdbhn2ssWByAM5jLXxgqtrYQsxMDnexpLXIlX7zSnNTfb1z8nqwPx98vLiasXQcNz0qPymGjIOUQ9TA//yBqexNcVgkqvXIn0m/apA9kYM5NDqMwFZLVpEX61FEi2qF1crBllf7TAnGLFU7wXAyDYtOv/rMNmkip3GRrnfycTI+LxUvRsQh0lXYpTnz07+9Mn92Lu4+ClXmG3KjfL2vBTzdTBvK5SFZ7molfzL15hnAu7yUuXKmR4jt0mbXBN44PpHZSdskNhm6xb92PUZrNU1CNvh12dl/yJv16sRY6Nk2tUic4L500RZFpBda1f4SvhAWYtwmHeSYr6B+bmqgxuxvfnxJZ8Ws1WVBcQ73qnLAHwXq9FCy26S/7cwUqpZNMOCdJWXPeNiUqhxmnThN7n03waG/YWaJCC57zgwS/i9miuPFgncrmfGDdS01tNl5y5TOc1SRQSguRoxuRIxMxJ0HwACMlM2M537jKKZQVmkQkyUqdCCxM8mH8jUTgwjP9UkZzSeE48z+VmfXSC7tzwyj9WkM5Qm+Zp0yjpPFJVnbIpomsRWZ8RJSpGqdo3ney+d/HenD0NWdudJSrHtzs4dTi/dfyONwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAzfj/8BEKltmnQKF/0AAAAASUVORK5CYII=",
      course: "Machine Learning",
      status: "active",
      isOnline: false,
      lastActive: "1 day ago"
    }
  ];


  
  const navItems = [
    { icon: "https://plus.unsplash.com/premium_photo-1683865776032-07bf70b0add1?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", text: "Dashboard", active: true },
    { icon: "https://plus.unsplash.com/premium_photo-1683865776032-07bf70b0add1?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", text: "Tests" },
    { icon: "https://plus.unsplash.com/premium_photo-1683865776032-07bf70b0add1?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", text: "Courses" },
    { icon: "https://plus.unsplash.com/premium_photo-1683865776032-07bf70b0add1?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", text: "Profile" },
    { icon: "https://plus.unsplash.com/premium_photo-1683865776032-07bf70b0add1?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", text: "Leaderboard" },
    { icon: "https://plus.unsplash.com/premium_photo-1683865776032-07bf70b0add1?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", text: "Dark mode" },
  ];

  const recentTests = [
    { title: "C Programming", progress: 75 },
    { title: "Python Programming", progress: 45 }
  ];

  const stats = {
    testsWritten: 32,
    overallAverage: 80,
    testStats: {
      total: 32,
      passed: 12,
      failed: 19,
      pending: 1
    }
  };

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
            <img src="data:image/png;base64,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" alt="Logo" className="w-12 h-12" />
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
              {recentTests.map((test, index) => (
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
              {enrolledUsers.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  {/* User Avatar with Online Status */}
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

                  {/* User Info */}
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

            {/* View All Button */}
            <button className="w-full mt-4 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
              View All Enrolled Users
            </button>
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

          {/* Statistics */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-6">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold">{stats.testsWritten}</div>
                <div className="text-sm text-gray-500">Tests Written</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold">{stats.overallAverage}%</div>
                <div className="text-sm text-gray-500">Overall Average</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              <StatsBox label="Total" value={stats.testStats.total} />
              <StatsBox label="Passed" value={stats.testStats.passed} />
              <StatsBox label="Failed" value={stats.testStats.failed} />
              <StatsBox label="Pending" value={stats.testStats.pending} />
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
