// PostQuestion.jsx
import React, { useState } from "react";
import axios from "axios";

const PostQuestion = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [solutionFile, setSolutionFile] = useState(null);
  const [testCasesFile, setTestCasesFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleSolutionFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".c")) {
      setSolutionFile(file);
    } else {
      setMessage("Please upload a valid .c file for the solution.");
      e.target.value = null;
    }
  };

  const handleTestCasesFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".csv")) {
      setTestCasesFile(file);
    } else {
      setMessage("Please upload a valid .csv file for the test cases.");
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !solutionFile || !testCasesFile) {
      setMessage("Please fill in all fields and upload both files.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("solutionFile", solutionFile);
    formData.append("testCasesFile", testCasesFile);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BE_URL}/questions/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage("Question posted successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error uploading question:", error);
      setMessage("Error uploading question. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Post a New Question</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            rows="4"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Solution (.c file)</label>
          <input
            type="file"
            accept=".c"
            onChange={handleSolutionFileChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Test Cases (.csv file)</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleTestCasesFileChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        {message && <p className="text-red-500">{message}</p>}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default PostQuestion;
