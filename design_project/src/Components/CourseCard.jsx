import React from 'react';
import { BookOpen } from 'lucide-react';

const CourseCard = ({ title, imageSrc }) => {
  return (
    <article className="group flex flex-col bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageSrc} 
          alt={title || 'Course thumbnail'} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {title || 'Untitled Course'}
        </h2>
        
        <div className="flex items-center justify-between mt-auto">
          <button 
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1.5 transition-colors duration-200"
            onClick={() => console.log('View course:', title)}
          >
            <BookOpen size={16} />
            View Course
          </button>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;
