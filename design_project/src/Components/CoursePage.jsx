// CoursePage.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";

const CoursePage = () => {
  const { courseId } = useParams(); // Get course ID from the route

  // Replace this with your API call logic if needed
  const mockQuestions = [
    { id: 1, title: "Question 1" },
    { id: 2, title: "Question 2" },
    { id: 3, title: "Question 3" },
  ];

  return (
    <div className="flex h-screen bg-neutral-100">
      {/* Sidebar could be added here if needed */}

      <div className="flex-1 p-8 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Course Details: {courseId}</h2>

        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h3 className="text-xl font-bold mb-4">Questions</h3>
          <div className="space-y-3">
            {mockQuestions.map((question) => (
              <Link
                key={question.id}
                to={`/course/${courseId}/question/${question.id}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-purple-50 transition"
              >
                {question.title}
              </Link>
            ))}
          </div>
        </div>

        <Link to="/" className="text-purple-600 hover:text-purple-700">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default CoursePage;
