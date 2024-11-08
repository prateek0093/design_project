// CourseCard.jsx
import React from 'react';
import { BookOpen } from 'lucide-react';

const CourseCard = ({ courseName, courseCode }) => {
    return (
        <article className="group flex flex-col bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]">
            <div className="relative h-48 overflow-hidden">
                <img
                    src="https://media.istockphoto.com/id/700378830/photo/calendar-concept.jpg?s=2048x2048&w=is&k=20&c=LlxW7uwHJXCygBfqmCiYWucLoUYWLO4GW-RoClgj1eM="
                    alt={courseName || 'Course thumbnail'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    {courseName || 'Untitled Course'}
                </h2>
                <p className="text-gray-600">{courseCode || 'No code available'}</p>

                <div className="flex items-center justify-between mt-auto">
                    <button
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1.5 transition-colors duration-200"
                        onClick={() => console.log('View course:', courseName)}
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
