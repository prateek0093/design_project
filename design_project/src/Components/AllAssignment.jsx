import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import { PlusCircle, BookOpen, Search, Download } from "lucide-react";
import AssignmentCard from "./AssignmentCard";
import { Link } from "react-router-dom";
import AddAssignmentModal from "./_addAssignmentModal";
import Header from "./header.jsx";

const AllAssignmentPage = () => {
  const navigate = useNavigate();
  const { courseCode } = useParams();
  const [cookie] = useCookies(["accessToken"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalState, setModalState] = useState(false);
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [filename, setFilename] = useState("assignments_statistics");

  // Fetch all assignments for the course
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get(

            `${import.meta.env.VITE_BE_URL}/verified/author/courseAssignments/${courseCode}`,
            {
              headers: {
                Authorization: `Bearer ${cookie.accessToken}`,
              },
              withCredentials: true,
            }
        );
        setAssignments(response.data.assignments || []);
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setError("Error fetching assignments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [cookie.accessToken, courseCode]);

  const filteredAssignments = Array.isArray(assignments)
      ? assignments.filter((assignment) =>
          assignment.assignmentName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : [];

  // Handle select/unselect assignment for download
  const handleSelectAssignment = (assignmentId) => {
    setSelectedAssignments((prevState) =>
        prevState.includes(assignmentId)
            ? prevState.filter((id) => id !== assignmentId)
            : [...prevState, assignmentId]
    );
  };

  // Handle download button click
  const handleDownload = async () => {
    if (selectedAssignments.length === 0) {
      alert("Please select at least one assignment.");
      return;
    }

    try {
      // Backend call to get the Excel file for selected assignments
      const response = await axios.post(
          `${import.meta.env.VITE_BE_URL}/verified/author/download/assignments-statistics`,
          { assignmentIds: selectedAssignments },
          {
            headers: {
              Authorization: `Bearer ${cookie.accessToken}`,
            },
            withCredentials: true,
            responseType: "blob", // Important to handle binary data (Excel file)
          }
      );

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      // Use user-provided filename with .csv extension
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up the DOM
      window.URL.revokeObjectURL(url); // Free up memory
    } catch (error) {
      console.error("Error downloading the file:", error);
      alert("Error downloading the file. Please try again later.");
    } finally {
      setShowDownloadModal(false);  // Close the modal after download
    }
  };

  return (
      <div className="min-h-screen from-purple-50 via-white to-blue-50">
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
          <header className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-800">All Assignments</h1>
              </div>
              <button
                  onClick={() => setModalState(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <PlusCircle size={20} />
                <span>Create Assignment</span>
              </button>
            </div>

            <div className="relative max-w-md">
              <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
              />
              <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
              />
            </div>
          </header>

          {loading ? (
              <p>Loading Assignments...</p>
          ) : error ? (
              <p className="text-red-600">{error}</p>
          ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                {searchQuery ? (
                    <>
                      <h3 className="text-xl text-gray-600">No matching assignments found</h3>
                      <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
                    </>
                ) : (
                    <>
                      <h3 className="text-xl text-gray-600">No assignments available</h3>
                      <p className="text-gray-500 mt-2">Create your first assignment to get started.</p>
                    </>
                )}
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAssignments.map((assignment) => (
                    <div key={assignment.assignmentId} className="relative">
                      <Link
                          to={`/author/assignment/submission/${assignment.assignmentId}`}
                      >
                        <AssignmentCard
                            title={assignment.assignmentName}
                            startTime={assignment.startTime}
                            endTime={assignment.endTime}
                            id={assignment.assignmentId}
                        />
                      </Link>
                    </div>
                ))}
              </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
                onClick={() => setShowDownloadModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <Download size={20} />
              <span>Download Statistics</span>
            </button>
          </div>

          {showDownloadModal && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Download Assignment Statistics</h2>

                  {/* Filename Input */}
                  <div className="mb-4">
                    <label htmlFor="filename" className="block text-sm font-medium text-gray-700 mb-2">
                      File Name
                    </label>
                    <div className="flex">
                      <input
                          type="text"
                          id="filename"
                          value={filename}
                          onChange={(e) => setFilename(e.target.value)}
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-lg">
                        .csv
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Select Assignments</h3>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredAssignments.map((assignment) => (
                          <div key={assignment.assignmentId} className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                checked={selectedAssignments.includes(assignment.assignmentId)}
                                onChange={() => handleSelectAssignment(assignment.assignmentId)}
                                className="form-checkbox h-5 w-5 text-purple-600"
                            />
                            <span>{assignment.assignmentName}</span>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                        onClick={handleDownload}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                        disabled={selectedAssignments.length === 0}
                    >
                      Download
                    </button>
                    <button
                        onClick={() => setShowDownloadModal(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
          )}

          {modalState && <AddAssignmentModal setter={setModalState} />}
        </div>
      </div>
  );
};

export default AllAssignmentPage;