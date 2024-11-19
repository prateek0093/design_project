import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, Award } from "lucide-react";
import { useCookies } from "react-cookie";

export default function AssignmentStudentPage() {
  const { courseCode, assignment } = useParams();
  const [cookie] = useCookies(["accessToken"]);
  const [loading, setLoading] = useState(true);
  const [questionData, setQuestionData] = useState([]);
  const [assignmentName, setAssignmentName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BE_URL
          }/verified/student/assignmentQuestions/${courseCode}/${assignment}`,
          {
            headers: {
              Authorization: `Bearer ${cookie.accessToken}`,
            },
            withCredentials: true,
          }
        );
        console.log(response.data);
        if (response.data.success) {
          setQuestionData(response.data.questions || []);
          setAssignmentName(response.data.assignmentName || "Assignment");
        } else {
          console.error("Error fetching questions:", response.data);
          setQuestionData([]);
        }
      } catch (err) {
        console.error("Error fetching the assignment questions:", err);
        setQuestionData([]);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchQuestions();
  }, [courseCode, assignment, cookie.accessToken]);

  const handleSubmitAssignment = async () => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BE_URL
        }/verified/student/submission/courseAssignments/${courseCode}/${assignment}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${cookie.accessToken}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        navigate(`/verified/student/courseAssignments/${courseCode}`);
      } else {
        console.error("Error submitting assignment:", response.data);
      }
    } catch (err) {
      console.error("Error submitting the assignment:", err);
    }
  };

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
    <div className="min-h-screen  from-purple-50 via-white to-blue-50">
      {/* Shared Header */}
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
            <h1 className="text-2xl font-bold text-purple-600 mb-2">
              Assignment: {assignmentName}
            </h1>
            <p className="text-gray-600">Course Code: {courseCode}</p>
          </div>

          <div className="space-y-4">
            {questionData.length > 0 ? (
              questionData.map((one, index) => (
                <Accordion data={one} index={index} key={one.questionId} />
              ))
            ) : (
              <p className="text-gray-500 text-center">
                No questions available for this assignment.
              </p>
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors duration-200"
              onClick={handleSubmitAssignment}
            >
              Submit Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Accordion = ({ data, index }) => {
  const navigate = useNavigate();
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
              Question {index + 1}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Status: {data.questionStatus ? "Attempted" : "Not Attempted"}
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
                  Maximum Marks: {data.maxScore}
                </span>
              </div>

              <button
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm ${
                  data.questionStatus
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                } transition-colors duration-200`}
                onClick={() => {
                  if (!data.questionStatus) {
                    navigate(`/editor/${data.questionId}`);
                  }
                }}
                disabled={data.questionStatus}
              >
                {data.questionStatus ? "Already Attempted" : "Attempt Question"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
