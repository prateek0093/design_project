import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios"; // Added missing import
import { ChevronDown, ChevronUp, Clock } from "lucide-react"; // Using lucide icons for better UI

export default function CourseViewStudentPage() {
  const { courseCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [dummyData, setDummyData] = useState([]);

  useEffect(() => {
    const call = async () => {
      try {
        const response = await axios.get("/some-route-here", {
          headers: { "Content-Type": "application/json" },
        });
        // TODO: Use response data when API is ready
      } catch (err) {
        console.error("Error fetching the assignments of the course:", err);
      } finally {
        setLoading(false);
        setDummyData([
          {
            startTime: new Date(),
            endTime: new Date(Date.now() + 86400000), // Setting end time to tomorrow
            assignmentName: "Assignment 1: Introduction to React",
            assignmentId: "1234",
            courseId: "4",
            courseName: "Advanced Web Development",
          },
          {
            startTime: new Date(),
            endTime: new Date(Date.now() + 86400000), // Setting end time to tomorrow
            assignmentName: "Assignment 2: Introduction to React",
            assignmentId: "1234",
            courseId: "4",
            courseName: "Advanced Web Development",
          },
          {
            startTime: new Date(),
            endTime: new Date(Date.now() + 86400000), // Setting end time to tomorrow
            assignmentName: "Assignment 3: Introduction to React",
            assignmentId: "1234",
            courseId: "4",
            courseName: "Advanced Web Development",
          },
          // ... other dummy data items
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
          Loading Course Content...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
          <h1 className="text-2xl font-bold text-purple-600 mb-2">
            {dummyData[0].courseName}
          </h1>
          <p className="text-gray-600">Course ID: {dummyData[0].courseId}</p>
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

            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              onClick={() =>
                navigate(`/enrolled/${data.courseId}/${data.assignmentId}`)
              }
            >
              Attempt Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
