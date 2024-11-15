import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";

export default function AddAssignmentModal({ setter }) {
  const [state, setState] = useState(0);
  const { courseCode } = useParams();
  const [cookie] = useCookies(["accessToken"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    questions: [],
    assignmentName: "",
    startTime: "",
    endTime: "",
  });

  const handleSubmit = async () => {
    if (
        !formData.assignmentName ||
        !formData.startTime ||
        !formData.endTime
    ) {
      setState(0);
      alert("Please fill all fields.");
      return;
    }
    if (
        formData.questions.length === 0 ||
        formData.questions.some((q) => !q.ques || !q.maximumMarks || !q.cFile || !q.csv)
    ) {
      setState(1);
      alert("Each question must have text, maximum marks, and files.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Construct a FormData object
      const formDataToSend = new FormData();
      formDataToSend.append("assignmentName", formData.assignmentName);
      formDataToSend.append("startTime", formData.startTime);
      formDataToSend.append("endTime", formData.endTime);

      formData.questions.forEach((q, index) => {
        formDataToSend.append(`questions[${index}].ques`, q.ques);
        formDataToSend.append(`questions[${index}].maximumMarks`,q.maximumMarks)
        formDataToSend.append(`questions[${index}].cfile`, q.cFile);
        formDataToSend.append(`questions[${index}].csv`, q.csv);
      });
      formDataToSend.append("length", String(formData.questions.length));
      console.log(formDataToSend.get(`length`))
      const response = await axios.post(
          `${import.meta.env.VITE_BE_URL}/verified/author/addAssignment/${courseCode}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${cookie.accessToken}`,
            },
            withCredentials: true,
          }
      );

      if (response.status === 200) {
        alert("Assignment submitted successfully!");
        setter(false);
      } else {
        throw new Error("Failed to submit the assignment.");
      }
    } catch (err) {
      alert("Failed to submit the assignment.");
      console.error(err);
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
      questions: [
        ...formData.questions,
        { ques: "", maximumMarks: "", cFile: null, csv: null },
      ],
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

  const validateFields = () => {
    if (state === 0) {
      return (
        formData.assignmentName &&
        formData.startTime &&
        formData.endTime
      );
    } else if (state === 1) {
      return formData.questions.every((q) => q.ques && q.maximumMarks);
    }
    return true;
  };

  const handleNext = () => {
    if (validateFields()) {
      setState((prev) => Math.min(prev + 1, 2));
    } else {
      alert("Please fill in all required fields before proceeding.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-[80%] h-[80%] px-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Adding Assignment</h2>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
            onClick={() => setter(false)}
          >
            Close
          </button>
        </div>
        <div className="mt-4">
          {state === 0 && (
            <div className="flex flex-col gap-1">
              <h2>Assignment Name:</h2>
              <input
                type="text"
                value={formData.assignmentName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, assignmentName: e.target.value })
                }
                placeholder="Enter assignment name"
                className="w-full p-2 border rounded-lg"
              />

              <h2>Start Date:</h2>
              <input
                type="date"
                value={formData.startTime || ""}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="w-[400px] p-2 border rounded-lg"
              />

              <h2>End Date:</h2>
              <input
                type="date"
                value={formData.endTime || ""}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="w-[400px] p-2 border rounded-lg"
              />
            </div>
          )}

          {state === 1 && (
            <div className="flex flex-col max-h-[300px] overflow-y-auto">
              {formData.questions.map((question, index) => (
                <div key={index} className="flex flex-col gap-1 border-b pb-4">
                  <h2>Question {index + 1}:</h2>
                  <input
                    type="text"
                    value={question.ques}
                    onChange={(e) =>
                      handleQuestionChange(index, "ques", e.target.value)
                    }
                    placeholder="Enter question text"
                    className="w-full p-2 border rounded-lg"
                  />
                  <h2>Maximum Marks:</h2>
                  <input
                    type="number"
                    value={question.maximumMarks || ""}
                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        "maximumMarks",
                        e.target.value
                      )
                    }
                    placeholder="Enter maximum marks for question"
                    className="w-full p-2 border rounded-lg"
                  />
                  <h2>C File:</h2>
                  <input
                    type="file"
                    accept=".c"
                    onChange={(e) =>
                      handleQuestionChange(index, "cFile", e.target.files[0])
                    }
                    className="p-2 border rounded-lg"
                  />
                  <h2>CSV File:</h2>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) =>
                      handleQuestionChange(index, "csv", e.target.files[0])
                    }
                    className="p-2 border rounded-lg"
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

          {state === 2 && (
            <div className="flex flex-col max-h-[300px] overflow-y-auto">
              <div className="mt-6">
                <p>
                  <strong>Assignment Name:</strong> {formData.assignmentName}
                </p>
                <p>
                  <strong>Start Date:</strong> {formData.startTime}
                </p>
                <p>
                  <strong>End Date:</strong> {formData.endTime}
                </p>
                {formData.questions.map((question, index) => (
                  <div key={index} className="border-t mt-2 pt-2">
                    <p>
                      <strong>Question {index + 1}:</strong> {question.ques}
                    </p>
                    <p>
                      <strong>Maximum Marks:</strong> {question.maximumMarks}
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
                      {question.cFile && (
                        <button
                          onClick={() => downloadFile(question.cFile)}
                          className="text-blue-600 underline mt-1"
                        >
                          View C File
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="absolute bottom-3 flex items-center gap-3">
          <button
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
            disabled={state === 0}
            onClick={() => setState((val) => Math.max(val - 1, 0))}
          >
            Prev
          </button>
          {state < 2 && (
            <button
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
              onClick={handleNext}
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
