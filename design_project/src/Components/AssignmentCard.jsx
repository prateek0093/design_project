import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { DateTime } from 'luxon';

const AssignmentCard = ({ title, startTime, endTime, id }) => {
  // Function to format date strings to local timezone
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // Calculate submission status based on dates
    const getSubmissionStatus = (start, end) => {
        const now = DateTime.now(); // Current date and time
        const startDate = DateTime.fromISO(start); // Parse the start time from ISO string
        const endDate = DateTime.fromISO(end); // Parse the end time from ISO string


        return ''; // Between start and end time
    };

  const status = getSubmissionStatus(startTime, endTime);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2"/>
              <span className="text-sm">
    Start: {startTime.split("T")[0]}{" "}
                {startTime.split("T")[1].slice(0, 5)}
  </span>
            </div>

            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2"/>
              <span className="text-sm">
    End: {endTime.split("T")[0]}{" "}
                {endTime.split("T")[1].slice(0, 5)}
  </span>
            </div>
          </div>

          <button
              className="w-full mt-4 text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center justify-center space-x-1"
              onClick={(e) => {
                e.preventDefault();
                console.log('Assignment ID:', id);
              }}
          >
            <span>View Details</span>
            <span>→</span>
          </button>
        </div>
      </div>
  );
};

export default AssignmentCard;
