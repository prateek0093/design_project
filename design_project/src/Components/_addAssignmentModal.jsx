import { useState } from "react";
import axios from "axios";
export default function AddAssignmentModal({ setter }) {
  const [state, setState] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ questions: [] });

  const handleSubmit = async () => {
    // handle checks
    if (!formData.assignmentName || !formData.startTime || !formData.endTime) {
      setState(0);
      alert("Fill all fields.");
    }
    if (
      formData.questions.filter((question, index) => {
        if (question.ques && question.csv && question.cfile) return true;
        return false;
      }).length == 0
    ) {
      setState(1);
      alert("Number of question must be grater than Zero.");
    }
    setIsSubmitting(true);
    try {
      const first_half = {
        assignmentName: formData.assignmentName,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };
      const second_half = formData.questions.filter((question, index) => {
        if (question.ques && question.csv && question.cfile) return true;
        return false;
      });

      const requestData = {
        ...first_half,
        questions: second_half,
      };

      // Using axios to send the POST request
      const response = await axios.post("/verified/author/tests", requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        alert("Assignment submitted successfully!");
        setter(false); // Close the modal upon success
      } else {
        throw new Error("Failed to submit the assignment.");
      }
    } catch (err) {
      alert("failed to submit question.");
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };
  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { ques: "", cFile: null, csv: null }],
    });
  };
  const downloadFile = (file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-[80%] h-[80%] px-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Adding Assignment</h2>
          <button
            className=" bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
            onClick={() => setter(false)}
          >
            Close
          </button>
        </div>
        <div className="mt-4">
          {state == 0 && (
            <div className="flex flex-col gap-1">
              <h2>Assignment Name:</h2>
              <input
                type="text"
                value={formData?.assignmentName}
                onChange={(e) =>
                  setFormData({ ...formData, assignmentName: e.target.value })
                }
                placeholder="Enter course name"
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200"
              />
              <h2>Start Date:</h2>
              <input
                type="date"
                value={formData?.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                placeholder="Enter course name"
                className="w-[400px] p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200"
              />
              <h2>Start Date:</h2>
              <input
                type="date"
                value={formData?.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                placeholder="Enter course name"
                className="w-[400px] p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200"
              />
            </div>
          )}
          {state == 1 && (
            <div className="flex flex-col max-h-[300px] overflow-y-auto">
              {formData.questions.map((question, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <h2>Question {index + 1}:</h2>
                  <input
                    type="text"
                    value={question.ques}
                    onChange={(e) =>
                      handleQuestionChange(index, "ques", e.target.value)
                    }
                    placeholder="Enter question text"
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200"
                  />
                  <h2>C File:</h2>
                  <input
                    type="file"
                    accept=".c"
                    onChange={(e) =>
                      handleQuestionChange(index, "cfile", e.target.files[0])
                    }
                    className="p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200"
                  />
                  <h2>CSV File:</h2>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) =>
                      handleQuestionChange(index, "csv", e.target.files[0])
                    }
                    className="p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addQuestion}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Add Question
              </button>
            </div>
          )}
          {state == 2 && (
            <div className="flex flex-col max-h-[300px] overflow-y-auto">
              <div className="mt-6">
                <div className="flex flex-col gap-y-1">
                  <p>
                    <strong>Assignment Name:</strong> {formData.assignmentName}
                  </p>
                  <p>
                    <strong>Start Date:</strong> {formData.startTime}
                  </p>
                  <p>
                    <strong>End Date:</strong> {formData.endTime}
                  </p>

                  {formData.questions
                    .filter((question, index) => {
                      if (question.ques && question.csv && question.cfile)
                        return true;
                      return false;
                    })
                    .map((question, index) => (
                      <div key={index} className="border-t mt-2 pt-2">
                        <p>
                          <strong>Question {index + 1}:</strong> {question.ques}
                        </p>
                        <div className="flex gap-2">
                          {question.csv && (
                            <button
                              onClick={() => downloadFile(question.csv)}
                              className="text-blue-600 underline mt-1"
                            >
                              View CSV File
                            </button>
                          )}
                          {question.cfile && (
                            <button
                              onClick={() => downloadFile(question.cfile)}
                              className="text-blue-600 underline mt-1"
                            >
                              View cfile File
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="absolute bottom-3 flex items-center gap-3">
          <button
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
            disabled={state === 0}
            onClick={() => {
              setState((val) => Math.max(val - 1, 0)); // Decrement state safely
            }}
          >
            Prev
          </button>
          {state < 2 && (
            <button
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
              onClick={() => {
                setState((val) => Math.min(val + 1, 2)); // Increment state safely
              }}
            >
              Next
            </button>
          )}
          {state === 2 && (
            <button
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
