import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../header.jsx";
import axios from "axios";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { useCookies } from "react-cookie";

export default function CourseViewStudentPage() {
  const { courseCode } = useParams();
  const [cookie] = useCookies(["accessToken"]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get(
            `${import.meta.env.VITE_BE_URL}/verified/student/courseAssignments/${courseCode}`,
            {
              headers: {
                Authorization: `Bearer ${cookie.accessToken}`,
              },
              withCredentials: true,
            }
        );

        console.log(response.data); // Inspect the response structure

        if (response.data.success && Array.isArray(response.data.assignments)) {
          setAssignments(response.data.assignments);
        } else {
          console.error("No assignments found for this course or invalid response format.");
          setAssignments([]);  // Ensure assignments is an empty array if no assignments are found
        }
      } catch (err) {
        console.error("Error fetching the assignments of the course:", err);
        setAssignments([]);  // Ensure assignments is an empty array in case of an error
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchAssignments();
  }, [courseCode, cookie.accessToken]);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-purple-600 text-xl font-semibold animate-pulse">
            Loading Course Content...
          </div>
        </div>
    );
  }

  if (assignments.length === 0) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-gray-600 text-xl font-semibold">
            No assignments available for this course.
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen from-purple-50 via-white to-blue-50">
        {/* Shared Header */}
        <Header />
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
              <h1 className="text-2xl font-bold text-purple-600 mb-2">
                {assignments[0].courseName}
              </h1>
              <p className="text-gray-600">
                Course Code: {assignments[0].courseCode}
              </p>
            </div>

            <div className="space-y-4">
              {Array.isArray(assignments) && assignments.length > 0 ? (
                  assignments.map((assignment, index) => (
                      <Accordion
                          data={assignment}
                          key={assignment.assignmentId || index}
                      />
                  ))
              ) : (
                  <div className="text-red-600">Error: Assignments data is not available</div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

const Accordion = ({ data }) => {
  const navigate = useNavigate();
  const { courseCode } = useParams();
  const [isOpen, setOpen] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200">
        <div
            className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
            onClick={() => setOpen(!isOpen)}
        >
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium text-gray-900">
              {data.assignmentName}
            </h3>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {isOpen && (
            <div className="px-4 pb-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={16} className="mr-2" />
                    <span>Start: {formatDate(data.startTime)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={16} className="mr-2" />
                    <span>End: {formatDate(data.endTime)}</span>
                  </div>
                </div>

                {data.isSubmitted ? (
                    <div className="text-sm font-medium text-green-600">
                      ✅ Assignment Submitted
                    </div>
                ) : (
                    <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                        onClick={() =>
                            navigate(`/enrolled/${courseCode}/${data.assignmentId}`)
                        }
                    >
                      Attempt Assignment
                    </button>
                )}
              </div>
            </div>
        )}
      </div>
  );
};
