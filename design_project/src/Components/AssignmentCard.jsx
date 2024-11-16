// AssignmentCard.js
import React from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';

const AssignmentCard = ({ title, dueDate, duration, description, status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <article className="group flex flex-col bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]">
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
            {status || 'Not Started'}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        <div className="flex items-center gap-4 mt-auto text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{dueDate || 'No due date'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{duration || 'Not specified'}</span>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button 
            className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors duration-200"
            onClick={() => console.log('View assignment details')}
          >
            View Details →
          </button>
        </div>
      </div>
    </article>
  );
};

export default AssignmentCard;