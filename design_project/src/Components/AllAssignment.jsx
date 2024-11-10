import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import { PlusCircle, BookOpen, Search } from "lucide-react";
import AssignmentCard from "./AssignmentCard";
import { Link } from "react-router-dom";
import AddAssignmentModal from "./_addAssignmentModal";

const AllAssignmentPage = () => {
  const navigate = useNavigate();
  const { courseCode } = useParams();
  const [cookie] = useCookies(["accessToken"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalState, setModalState] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BE_URL
          }/verified/author/addAssignment/${courseCode}`,
          {
            headers: {
              Authorization: `Bearer ${cookie.accessToken}`,
            },
            withCredentials: true,
          }
        );

        // Set assignments with updated fields from response
        setAssignments(response.data.assignments || []);
      } catch (err) {
        setError("Error fetching assignments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [cookie.accessToken, courseCode]);

  const filteredAssignments = Array.isArray(assignments)
    ? assignments.filter((assignment) =>
        assignment.assignmentName
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              All Assignments
            </h1>
          </div>
          <button
            onClick={() => setModalState(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <PlusCircle size={20} />
            <span>Create Assignment</span>
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
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
          />
        </div>
      </header>

      {/* Assignments List */}
      {loading ? (
        <p>Loading Assignments...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery ? (
            <>
              <h3 className="text-xl text-gray-600">
                No matching assignments found
              </h3>
              <p className="text-gray-500 mt-2">
                Try adjusting your search terms
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl text-gray-600">
                No assignments available yet
              </h3>
              <p className="text-gray-500 mt-2">
                Create your first assignment to get started
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssignments.map((assignment) => (
            <Link to={`/assignment/${assignment.id}`} key={assignment.id}>
              <AssignmentCard
                title={assignment.assignmentName}
                startDate={assignment.startDate}
                endDate={assignment.endDate}
                id={assignment.id}
                data={assignment.data}
              />
            </Link>
          ))}
        </div>
      )}

      {modalState && <AddAssignmentModal setter={setModalState} />}
    </div>
  );
};

export default AllAssignmentPage;
