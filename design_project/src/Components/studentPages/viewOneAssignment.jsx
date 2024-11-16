import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios"; // Added missing import
import { ChevronDown, ChevronUp, Award } from "lucide-react"; // Using lucide icons for better UI

export default function AssignmentStudentPage() {
  const { courseCode, assignment } = useParams();
  const [loading, setLoading] = useState(true);
  const [dummyData, setDummyData] = useState([]);

  useEffect(() => {
    const call = async () => {
      try {
        const response = await axios.get(
          "/some-route-here-to-get-assignment-data-here...",
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        // TODO: Use response data when API is ready
      } catch (err) {
        console.error("Error fetching the assignments:", err);
      } finally {
        setLoading(false);
        setDummyData([
          {
            maximumMarks: 72,
            assignmentId: "123456",
            assignmentQues:
              "1. Implement a function to find the longest common subsequence of two strings.",
          },
          {
            maximumMarks: 72,
            assignmentId: "123457",
            assignmentQues:
              "2. Create a binary search tree implementation with insert, delete, and search operations.",
          },
          // ... other dummy data
        ]);
      }
    };
    setLoading(true);
    call();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-purple-600 text-xl font-semibold animate-pulse">
          Loading Assignment Content...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
          <h1 className="text-2xl font-bold text-purple-600 mb-2">
            Assignment: {assignment}
          </h1>
          <p className="text-gray-600">Course Code: {courseCode}</p>
        </div>

        <div className="space-y-4">
          {dummyData.map((one, index) => (
            <Accordion data={one} key={one.assignmentId || index} />
          ))}
        </div>
      </div>
    </div>
  );
}

const Accordion = ({ data }) => {
  const navigate = useNavigate(); // Fixed variable name convention
  const [isOpen, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
      <div
        className="p-6 cursor-pointer select-none"
        onClick={() => setOpen(!isOpen)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <p className="text-lg font-medium text-gray-900 leading-relaxed">
              {data.assignmentQues}
            </p>
          </div>
          <button
            className="flex-shrink-0 text-gray-400 hover:text-purple-600 transition-colors duration-200 mt-1"
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center text-gray-600">
                <Award className="w-5 h-5 mr-2 text-purple-600" />
                <span className="text-base">
                  Maximum Marks: {data.maximumMarks}
                </span>
              </div>

              <button
                className="inline-flex items-center px-6 py-3 border border-transparent 
                  text-base font-medium rounded-md shadow-sm text-white 
                  bg-purple-600 hover:bg-purple-700 focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 
                  transition-colors duration-200"
                onClick={() => navigate(`/editor/${data.assignmentId}`)}
              >
                Attempt Question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
