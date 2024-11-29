import React, { useState, useEffect } from "react";
import { ArrowUpDown, Loader2, Eye } from "lucide-react";
import Header from "./header";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import Modal from "./Modal.jsx";

const Submission = () => {
  const [students, setStudents] = useState([]);
  const [cookie] = useCookies(["accessToken"]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "rollNumber",
    direction: "asc",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const { assignmentId } = useParams();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
            `${import.meta.env.VITE_BE_URL}/verified/author/viewStudentSubmission/${assignmentId}`,
            {
              headers: {
                Authorization: `Bearer ${cookie.accessToken}`,
              },
              withCredentials: true,
            }
        );

        if (response.data.success && response.data.subDetails) {
          setStudents(response.data.subDetails);
        } else {
          setError("No submission details available");
        }
      } catch (err) {
        setError("Failed to fetch student list. Please try again later.");
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [assignmentId, cookie.accessToken]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
          sortConfig.key === key && sortConfig.direction === "asc"
              ? "desc"
              : "asc",
    });
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (sortConfig.direction === "asc") {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
          <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Student Submissions
              </h1>
              <p className="text-gray-600">
                Hover over questions to view submitted code
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  Student List
                </h2>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                    <div className="px-6 py-16 text-center">
                      <Loader2 className="animate-spin mx-auto" size={20} />
                      <span className="block mt-2 text-gray-500">
                    Loading students...
                  </span>
                    </div>
                ) : error ? (
                    <div className="px-6 py-16 text-center text-red-500">
                      {error}
                    </div>
                ) : students.length === 0 ? (
                    <div className="px-6 py-16 text-center text-gray-500">
                      No student submissions available.
                    </div>
                ) : (
                    <table className="min-w-full table-auto">
                      <thead>
                      <tr className="bg-gray-100">
                        <th
                            className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                            onClick={() => handleSort("rollNumber")}
                        >
                          Roll Number
                          <ArrowUpDown className="inline-block ml-2" />
                        </th>
                        <th
                            className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                            onClick={() => handleSort("username")}
                        >
                          Student Name
                          <ArrowUpDown className="inline-block ml-2" />
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                          Marks
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                          Questions Submitted
                        </th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                      {sortedStudents.map((student) => (
                          <tr
                              key={student.rollNumber}
                              className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 text-sm text-gray-800">
                              {student.rollNumber}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800">
                              {student.username}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800">
                              {student.marks}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800 relative">
                              {student.submittedData.length} Questions
                              <div className="flex space-x-2 mt-2">
                                {student.submittedData.map((data, idx) => (
                                    <div
                                        key={idx}
                                        className="group relative"
                                        onClick={() => {
                                          setSelectedStudent({
                                            title:data.questionText,
                                            question: data.submittedQuestions,
                                            index: idx,
                                            roll: student.rollNumber,
                                          });
                                          setModalOpen(true);
                                        }}
                                    >
                                <span className="cursor-pointer px-2 py-1 bg-gray-200 rounded hover:bg-blue-100">
                                  Q{idx + 1}
                                </span>

                                    </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                )}
              </div>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedStudent ? (
                    <>
                  {selectedStudent.title}
                    </>
                ) : (
                    <p>No Data</p>
                )}
                content={
                  selectedStudent ? (
                      <>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm text-gray-700">
                    {selectedStudent.question}
                  </pre>
                      </>
                  ) : (
                      <p>No Data</p>
                  )
                }
            />
          </main>
        </div>
      </div>
  );
};

export default Submission;
