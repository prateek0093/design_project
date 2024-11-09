// CourseAssignments.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CourseAssignments = () => {
  const { courseCode } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get(
          import.meta.env.VITE_BE_URL + "/verified/author/dashboard"
        );
        setAssignments(response.data.assignments);
        setLoading(false);
      } catch (err) {
        setError("Failed to load assignments.");
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [courseCode]);

  const handleAddAssignment = () => {
    // Navigate to a new page or show a modal for adding assignments
    console.log("Navigate to assignment creation page");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Assignments for {courseCode}
        </h2>
        <button
          onClick={handleAddAssignment}
          className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          Add Assignment
        </button>
      </header>
      {loading ? (
        <p>Loading assignments...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : assignments.length === 0 ? (
        <p className="text-gray-600">No assignments yet for this course.</p>
      ) : (
        <ul className="space-y-4">
          {assignments.map((assignment) => (
            <li key={assignment.id} className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">{assignment.title}</h3>
              <p className="text-gray-600">{assignment.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CourseAssignments;
