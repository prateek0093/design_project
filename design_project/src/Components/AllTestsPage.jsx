import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import { PlusCircle, BookOpen, Search } from "lucide-react";
import TestCard from "./TestCard";

const AllTestsPage = () => {
  const navigate = useNavigate();
  const { courseCode } = useParams();
  const [cookie] = useCookies(["accessToken"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [testData, setTestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await axios.get(
            `${import.meta.env.VITE_BE_URL}/verified/author/addAssignment/${courseCode}`,
            {
              headers: {
                Authorization: `Bearer ${cookie.accessToken}`,
              },
              withCredentials: true,
            }
        );

        // Access the assignments array in the response data
        setTestData(response.data.assignments || []); // Ensure it’s an array or an empty array
      } catch (err) {
        setError("Error fetching test data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [cookie.accessToken, courseCode]);

  const filteredTests = Array.isArray(testData)
      ? testData.filter((test) =>
          test.assignmentName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : [];

  const handleCreateTest = () => {
    if (import.meta.env.VITE_BE_DEVSTAGE === "DEV") {
      console.log("Navigate to test creation page");
    } else {
      navigate("/create-test");
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <header className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-800">All Tests</h1>
            </div>
            <button
                onClick={handleCreateTest}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <PlusCircle size={20} />
              <span>Create Test</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
            />
            <input
                type="text"
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
            />
          </div>
        </header>

        {/* Tests List */}
        {loading ? (
            <p>Loading tests...</p>
        ) : error ? (
            <p className="text-red-600">{error}</p>
        ) : filteredTests.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery ? (
                  <>
                    <h3 className="text-xl text-gray-600">No matching tests found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
                  </>
              ) : (
                  <>
                    <h3 className="text-xl text-gray-600">No tests available yet</h3>
                    <p className="text-gray-500 mt-2">Create your first test to get started</p>
                  </>
              )}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTests.map((test) => (
                  <a href={`/tests/${test.id}`} key={test.id}>
                    <TestCard title={test.assignmentName} id={test.id} />
                  </a>
              ))}
            </div>
        )}
      </div>
  );
};

export default AllTestsPage;
