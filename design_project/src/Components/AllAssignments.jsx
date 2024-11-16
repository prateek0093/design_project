// AllAssignments.js
import React, { useState, useEffect } from 'react';
import { PlusCircle, FileText, Search } from 'lucide-react';
import AssignmentCard from './AssignmentCard';
import Header from './Header';

const AllAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/assignments');
        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logging out...');
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Header onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4 mx-auto"></div>
              <p className="text-gray-600">Loading assignments...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="flex flex-col gap-6 mb-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-800">All Assignments</h1>
            </div>
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              onClick={() => console.log('Add new assignment')}
            >
              <PlusCircle size={20} />
              <span>Add Assignment</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
            />
          </div>
        </header>

        {/* Assignments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              {...assignment}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            {searchQuery ? (
              <>
                <h3 className="text-xl text-gray-600">No matching assignments found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
              </>
            ) : (
              <>
                <h3 className="text-xl text-gray-600">No assignments available yet</h3>
                <p className="text-gray-500 mt-2">Add your first assignment to get started</p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllAssignments;