import React, { useState } from "react";
import { useCookies } from "react-cookie";
import Header from "./header.jsx";
import { PlusCircle, Loader2, Save } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const AddCourse = () => {
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [branch, setBranch] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [cookies] = useCookies(["accessToken"]);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = async () => {
    if (
      !courseName.trim() ||
      !courseCode.trim() ||
      !branch.trim() ||
      !batchYear.trim()
    ) {
      setError("Please fill in all the fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        courseName,
        courseCode,
        branch,
        batchYear,
      };

      const response = await axios.post(
        import.meta.env.VITE_BE_URL + "/verified/author/addCourse",
        payload,
        {
          headers: {
            Authorization: `Bearer ${cookies.accessToken}`,
          },
          withCredentials: true,
        }
      );

      if (response.data && response.data.success) {
        // Clear the form
        setCourseName("");
        setCourseCode("");
        setBranch("");
        setBatchYear("");

        alert("Course added successfully!");
        navigate("/profDashboard"); // Redirect to /profDashboard
      } else {
        setError("Failed to add course. Please try again.");
      }
    } catch (err) {
      setError("Failed to add course. Please try again.");
      console.error("Error adding course:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen from-purple-50 via-white to-blue-50">
      {/* Shared Header */}
      <Header />
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Add Course
            </h1>
            <p className="text-gray-600">
              Enter the details to add a new course
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Name
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Enter course name"
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Code
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="Enter course code"
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200"
              >
                <option value="">Select branch</option>
                <option value="IT">IT</option>
                <option value="CSE">CSE</option>
                <option value="Both">Both</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Year (If you are assigning this course to batch 2024 write batch 2024 below)
              </label>
              <input
                type="number"
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                placeholder="2024"
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200"
              />
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Adding Course...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Add Course</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddCourse;
