// _modal.jsx
import React from "react";
import { X, AlertTriangle, Shield } from "lucide-react"; // Using Lucide icons

export default function Modal({ activity, open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl transform transition-all w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="p-6">
            {activity === "copypaste" ? (
              <div className="flex flex-col items-center text-center">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Copy-Paste Detected
                </h3>

                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2 mb-6">
                  <p>
                    Copy-paste activity has been detected and reported to
                    faculty.
                  </p>
                  <p className="font-medium text-red-600 dark:text-red-400">
                    Warning: Next occurrence will result in exam termination.
                  </p>
                </div>

                <div className="flex flex-col space-y-3 w-full">
                  <button
                    onClick={onClose}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent 
                      text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 
                      transition-colors duration-200"
                  >
                    <Shield className="h-4 w-4 mr-2" />I Understand
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Message
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  {activity}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
