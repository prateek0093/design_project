import React, { useState, useRef, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { BookOpen } from "lucide-react"; // Added icons
import Modal from "./_modal.jsx";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";

const EditorWindow = () => {
  const { testId } = useParams(); // Get additional params
  const navigate = useNavigate(); // Hook for navigation
  const [cookie] = useCookies(["accessToken"]);
  const [activity, setActivity] = useState("");
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [questionText, setQuestionText] = useState("Loading question...");
  const editorRef = useRef(null);
  const [courseCode, setCourseCode] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); // Track submission status
  const [isLoading, setLoading] = useState(false);
  const [runMessage, setRunMessage] = useState(""); // Store backend message for run
  const[runErrorMessage,setRunErrorMessage] = useState("");
  const [isRunning, setIsRunning] = useState(false); // Track running state
  const[firstTestCaseInput, setFirstTestCaseInput] = useState("");
  const[firstTestCaseOutput, setFirstTestCaseOutput] = useState("");
  // Create a ref for the message container to handle scrolling
  const messageRef = useRef(null);

  // Fetch question text
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(
            `${import.meta.env.VITE_BE_URL}/verified/student/questionText/${testId}`,
            {
              headers: {
                Authorization: `Bearer ${cookie.accessToken}`,
              },
              withCredentials: true,
            }
        );
        console.log(response)

        if (response.data.success) {
          setCourseCode(response.data.courseCode); // Update state
          setAssignmentId(response.data.assignmentId); // Update state
          setQuestionText(response.data.questionText || "Question not found.");
          setFirstTestCaseInput(response.data.firstTestCaseInput);
          setFirstTestCaseOutput(response.data.firstTestCaseOutput);
          if(response.data.status){
            navigate(-1);
          }
        } else {
          setQuestionText("Failed to load question.");
        }
      } catch (error) {
        console.error("Error fetching question text:", error);
        setQuestionText("Error fetching question text.");
      }
    };
    fetchQuestion();
  }, [testId]);

  // Load saved code from localStorage
  useEffect(() => {
    const editorId = testId + "_code";
    const tempCode = localStorage.getItem(editorId) || "";
    const time = tempCode.split("|||")[0];
    if (time < new Date().getTime()) {
      return;
    }
    setCode(tempCode.split("|||")[1]);
  }, [testId]);

  const options = {
    selectOnLineNumbers: true,
    mouseWheelZoom: true,
    fontSize: 18,
    contextmenu: false,
    formatOnType: true,
    smoothScrolling: true,
    wordWrap: "on",
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    renderLineHighlight: "all",
    parameterHints: { enabled: true },
    lineHeight: 24,
  };

  const onMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.focus();

    editor.onKeyDown((event) => {
      const { keyCode, ctrlKey, metaKey } = event;
      if ((keyCode === 33 || keyCode === 52) && (metaKey || ctrlKey)) {
        event.preventDefault();
        setActivity("copypaste");
      }
    });
  };

  // Handle submit
  const handleSubmit = async () => {
    if (isSubmitted) {
      alert("You have already submitted your code.");
      return;
    }

    try {
      const file = new Blob([code], { type: "text/plain" });
      const formData = new FormData();
      formData.append("codeFile", file, `${testId}.c`);

      const response = await axios.post(
          `${import.meta.env.VITE_BE_URL}/verified/student/submitCode/${testId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${cookie.accessToken}`,
            },
            withCredentials: true,
          }
      );

      if (response.data.success) {
        alert("Code submitted successfully!");
        setIsSubmitted(true); // Mark submission as complete
        navigate(`/enrolled/${courseCode}/${assignmentId}`); // Redirect after success
      } else {
        alert("Failed to submit code.");
      }
    } catch (error) {
      console.error("Error submitting code:", error);
      alert("Error submitting code. Please try again.");
    }
  };

  // Handle run code
  const handleRun = async () => {
    if (isRunning) {
      return; // Prevent multiple requests
    }

    setIsRunning(true); // Set the run state to true
    setRunMessage(""); // Clear previous run messages
    setRunErrorMessage(""); // Clear previous error messages

    try {
      const file = new Blob([code], { type: "text/plain" });
      const formData = new FormData();
      formData.append("codeFile", file, `${testId}.c`);
      formData.append("firstTestCaseInput", firstTestCaseInput);  // Append first test case input
      formData.append("firstTestCaseOutput", firstTestCaseOutput); // Append first test case output
      const response = await axios.post(
          `${import.meta.env.VITE_BE_URL}/verified/student/runCode/${testId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${cookie.accessToken}`,
            },
            withCredentials: true,
          }
      );
      console.log(response)
      if (response.data.status) {
        setRunMessage(response.data.actualOutput); // Store the backend message
        setRunErrorMessage(response.data.err);
      } else {
        setRunMessage("Error running the code.");
      }
    } catch (error) {
      console.error("Error running code:", error);
      setRunMessage("Error running the code. Please try again.");
    } finally {
      setIsRunning(false); // Reset the run state
    }
  };

  // Scroll to the message when runMessage changes
  useEffect(() => {
    if (runMessage) {
      messageRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [runMessage]);

  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-300">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="border-b border-gray-700 pb-4 mb-6">
            <div className="flex flex-col items-start  space-x-4">
              <div className="flex items-center  space-x-4">
                <BookOpen className="h-6 w-6 text-indigo-400"/>
                <h1 className="text-2xl font-bold text-white">{questionText}</h1>
              </div>
              <div>
              <h1 className="text-xl font-bold text-white">Sample TestCase Input:  {firstTestCaseInput}</h1>
              <h1 className="text-xl font-bold text-white">Sample TestCase Output: {firstTestCaseOutput}</h1>
              </div>
            </div>
          </div>

          {/* Editor Section */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
            <Editor
                height="70vh"
                theme="vs-dark"
                language="c"
                options={options}
                defaultValue="// Write your code here..."
                onMount={onMount}
                value={code}
                onChange={(value) => {
                  const time = new Date().getTime() + 300000;
                  localStorage.setItem(testId + "_code", time + "|||" + value);
                  setCode(value);
                }}
                className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end mb-6">
            {/* Submit Button */}
            <div>
              <button
                  className={`inline-flex items-center px-6 py-3 text-lg font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                      isSubmitted
                          ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                          : "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500"
                  }`}
                  onClick={() => {
                    setLoading(true);
                    handleSubmit().then(() => setLoading(false));
                  }}
                  disabled={isSubmitted || isLoading} // Disable button if already submitted
              >
                {isSubmitted ? "Submitted" : "Submit Code"}
              </button>
            </div>

            {/* Run Button */}
            <div>
              <button
                  className={`inline-flex items-center px-6 py-3 text-lg font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                      isRunning
                          ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                  }`}
                  onClick={handleRun}
                  disabled={isRunning || isSubmitted} // Disable run button during the request or after submission
              >
                {isRunning ? "Running..." : "Run Code"}
              </button>
            </div>
          </div>

          {/* Display Backend Message */}
          {runMessage && (
              <div ref={messageRef} className="bg-gray-700 p-4 rounded-lg shadow-md mb-6">
                <p className="text-lg text-white">{runMessage}</p>
                <p className="text-lg text-white">{runErrorMessage!=="<nil>"?runErrorMessage:"Correct Answer"}</p>
              </div>
          )}

          {/* Modal for activity */}
          <Modal activity={activity} open={open} onClose={() => setOpen(false)} />
        </div>
      </div>
  );
};

export default EditorWindow;
