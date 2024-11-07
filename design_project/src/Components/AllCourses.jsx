import React, { useState, useEffect } from 'react';
import { PlusCircle, BookOpen, Search } from 'lucide-react';
import CourseCard from './CourseCard';

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="flex flex-col gap-6 mb-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-800">All Courses</h1>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
              <PlusCircle size={20} />
              <span>Add Course</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
            />
          </div>
        </header>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              imageSrc={course.imageSrc || 'https://media.istockphoto.com/id/700378830/photo/calendar-concept.jpg?s=2048x2048&w=is&k=20&c=LlxW7uwHJXCygBfqmCiYWucLoUYWLO4GW-RoClgj1eM='}
              isUpcoming={course.isUpcoming}
              duration={course.duration}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            {searchQuery ? (
              <>
                <h3 className="text-xl text-gray-600">No matching courses found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
              </>
            ) : (
              <>
                <h3 className="text-xl text-gray-600">No courses available yet</h3>
                <p className="text-gray-500 mt-2">Add your first course to get started</p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllCourses;