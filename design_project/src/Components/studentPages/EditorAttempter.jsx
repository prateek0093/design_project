// EditorWindow.jsx
import React, { useState, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { BookOpen, AlertCircle } from "lucide-react"; // Added icons
import Modal from "./_modal.jsx";

const EditorWindow = () => {
  const [activity, setActivity] = useState("");
  const [open, setOpen] = useState(false);
  const editorRef = useRef(null);

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

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-screen-2xl mx-auto px-4">
        {/* Header Section */}
        <div className="py-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-semibold text-white">
                Question: question_name_here...
              </h1>
            </div>
          </div>
        </div>

        {/* Editor Section */}
        <div className="mt-6">
          <div className="rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
            <Editor
              height="85vh"
              theme="vs-dark"
              language="c"
              options={options}
              defaultValue="// Write your code here..."
              onMount={onMount}
              className="w-full"
            />
          </div>
        </div>

        <Modal activity={activity} open={open} onClose={() => setOpen(false)} />
      </div>
    </div>
  );
};

export default EditorWindow;
