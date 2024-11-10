import React from "react";

const AssignmentCard = ({ title, startDate, endDate, id, data }) => (
  <div className="p-6 bg-white shadow-lg rounded-lg transition-transform duration-200 hover:scale-105">
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <div className="flex flex-col space-y-1 text-gray-600">
      <p className="flex items-center">
        <span className="font-medium text-gray-700">Start Date:</span>{" "}
        <span className="ml-2">{new Date(startDate).toLocaleDateString()}</span>
      </p>
      <p className="flex items-center">
        <span className="font-medium text-gray-700">End Date:</span>{" "}
        <span className="ml-2">{new Date(endDate).toLocaleDateString()}</span>
      </p>
    </div>
    <div className="mt-4 flex justify-end">
      <button className="px-4 py-2 text-white bg-purple-600 rounded-lg shadow hover:bg-purple-700 transition-colors duration-200">
        View Details
      </button>
    </div>
  </div>
);

export default AssignmentCard;
