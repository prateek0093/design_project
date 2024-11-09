// AllCourses.jsx
import React, { useState, useEffect } from "react";
import { PlusCircle, BookOpen, Search } from "lucide-react";
import CourseCard from "./CourseCard";
import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cookies] = useCookies(["accessToken"]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_BE_URL + "/verified/author/dashboard",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${cookies.accessToken}`, // Send the token in the request header
            },
            credentials: "include", // Ensures cookies are sent with the request
          }
        );
        if (!response.ok) {
          console.error("Failed to fetch courses:", response.statusText);
          navigate("/");
          return;
        }
        const data = await response.json();
        console.log(data);
        setCourses(data.courses); // Set only the courses array
      } catch (error) {
        console.error("Error fetching courses:", error);
        navigate("/");
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="flex flex-col gap-6 mb-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-800">All Courses</h1>
            </div>
            <Link
              to="/profDashboard/addCourses"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
                <PlusCircle size={20} />
                <span>Add Course</span>
              </button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
            />
          </div>
        </header>

        {/* Courses Grid */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course, index) => (
            <Link
              key={index}
              to={`/profDashboard/addAssignment/${course.courseCode}`}
              style={{ textDecoration: "none" }}
            >
              <CourseCard
                courseName={course.courseName}
                courseCode={course.courseCode}
              />
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            {searchQuery ? (
              <>
                <h3 className="text-xl text-gray-600">
                  No matching courses found
                </h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search terms
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl text-gray-600">
                  No courses available yet
                </h3>
                <p className="text-gray-500 mt-2">
                  Add your first course to get started
                </p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllCourses;
