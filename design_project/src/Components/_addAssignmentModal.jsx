import React, { useState } from "react";
import axios from "axios";

const CreateAssignment = ({ courseCode, setter }) => {
  const [formData, setFormData] = useState({
    assignmentName: "",
    startTime: "",
    endTime: "",
    questions: [{ ques: "", cfile: null, csv: null }],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const [prefix, index, field] = name.split(".");

    if (field === "ques") {
      const updatedQuestions = [...formData.questions];
      updatedQuestions[index][field] = value;
      setFormData({ ...formData, questions: updatedQuestions });
    } else if (field === "csv" || field === "cfile") {
      const updatedQuestions = [...formData.questions];
      updatedQuestions[index][field] = files[0];
      setFormData({ ...formData, questions: updatedQuestions });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { ques: "", cfile: null, csv: null },
      ],
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleSubmit = async () => {
    // Handle validations
    if (!formData.assignmentName || !formData.startTime || !formData.endTime) {
      alert("Fill all fields.");
      return;
    }

    if (formData.questions.filter((question) => question.ques && question.csv && question.cfile).length === 0) {
      alert("Number of questions must be greater than zero.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("assignmentName", formData.assignmentName);
      formDataToSend.append("startTime", formData.startTime);
      formDataToSend.append("endTime", formData.endTime);

      // Add questions to FormData
      formData.questions.forEach((question, index) => {
        if (question.ques && question.csv && question.cfile) {
          formDataToSend.append(`questions[${index}].ques`, question.ques);
          formDataToSend.append(`questions[${index}].csv`, question.csv);
          formDataToSend.append(`questions[${index}].cfile`, question.cfile);
        }
      });

      const response = await axios.post(
          `${import.meta.env.VITE_BE_URL}/verified/author/addAssignment/${courseCode}`,
          formDataToSend,
          { withCredentials: true }
      );

      if (response.status === 200) {
        alert("Assignment submitted successfully!");
        setter(false); // Close the modal upon success
      } else {
        throw new Error("Failed to submit the assignment.");
      }
    } catch (err) {
      alert("Failed to submit Assignment.");
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div>
        <h1>Create Assignment</h1>
        <form>
          <div>
            <label>Assignment Name:</label>
            <input
                type="text"
                name="assignmentName"
                value={formData.assignmentName}
                onChange={handleChange}
            />
          </div>

          <div>
            <label>Start Time:</label>
            <input
                type="date"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
            />
          </div>

          <div>
            <label>End Time:</label>
            <input
                type="date"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
            />
          </div>

          <h3>Questions</h3>
          {formData.questions.map((question, index) => (
              <div key={index}>
                <div>
                  <label>Question Text:</label>
                  <input
                      type="text"
                      name={`questions.${index}.ques`}
                      value={question.ques}
                      onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Code File (.c):</label>
                  <input
                      type="file"
                      name={`questions.${index}.cfile`}
                      onChange={handleChange}
                      accept=".c"
                  />
                </div>

                <div>
                  <label>Test Cases File (.csv):</label>
                  <input
                      type="file"
                      name={`questions.${index}.csv`}
                      onChange={handleChange}
                      accept=".csv"
                  />
                </div>

                <button type="button" onClick={() => removeQuestion(index)}>
                  Remove Question
                </button>
              </div>
          ))}

          <button type="button" onClick={addQuestion}>
            Add Question
          </button>

          <div>
            <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
            >
              {isSubmitting ? "Submitting..." : "Submit Assignment"}
            </button>
          </div>
        </form>
      </div>
  );
};

export default CreateAssignment;
