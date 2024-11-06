import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import axios from 'axios';

const Submission = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'rollId', direction: 'asc' });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/results');
        setResults(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch results. Please try again later.');
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Student Results</h1>
          <p className="text-gray-600">View student examination results</p>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th 
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => handleSort('rollId')}
                  >
                    <div className="flex items-center gap-2">
                      Roll ID
                      <ArrowUpDown size={16} className={sortConfig.key === 'rollId' ? 'text-purple-600' : 'text-gray-400'} />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Student Name
                      <ArrowUpDown size={16} className={sortConfig.key === 'name' ? 'text-purple-600' : 'text-gray-400'} />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => handleSort('totalMarks')}
                  >
                    <div className="flex items-center gap-2">
                      Total Marks
                      <ArrowUpDown size={16} className={sortConfig.key === 'totalMarks' ? 'text-purple-600' : 'text-gray-400'} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-16 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-gray-500">Loading results...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-16 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : sortedResults.length ? (
                  sortedResults.map((result) => (
                    <tr 
                      key={result.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {result.rollId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {result.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {result.totalMarks}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-16 text-center text-gray-500">
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Submission;