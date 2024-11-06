import React, { useState } from 'react';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';
import axios from 'axios';

const AddQuestion = () => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ id: 1, text: '', marks: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: questions.length + 1, text: '', marks: '' }
    ]);
  };

  const removeQuestion = (idToRemove) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== idToRemove));
    }
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      setError('Please enter an assignment title');
      return;
    }

    if (questions.some(q => !q.text.trim())) {
      setError('Please fill in all questions');
      return;
    }

    if (questions.some(q => isNaN(parseFloat(q.marks)) || parseFloat(q.marks) < 0)) {
      setError('Please enter valid marks (number greater than or equal to 0)');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        title,
        questions: questions.map(({ text, marks }) => ({ text, marks: parseFloat(marks) }))
      };

      await axios.post('/api/assignments', payload);
      
      // Clear form after successful submission
      setTitle('');
      setQuestions([{ id: 1, text: '', marks: '' }]);
      alert('Assignment created successfully!');
      
    } catch (err) {
      setError('Failed to create assignment. Please try again.');
      console.error('Error creating assignment:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Assignment</h1>
          <p className="text-gray-600">Add questions to create a new assignment</p>
        </div>

        {/* Assignment Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Title Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter assignment title"
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200"
            />
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div 
                key={question.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-200 transition-colors duration-200"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-700">
                    Question {index + 1}
                  </h3>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <textarea
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                    placeholder="Enter your question here..."
                    rows={3}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={question.marks}
                      onChange={(e) => updateQuestion(question.id, 'marks', e.target.value)}
                      placeholder="Marks"
                      min="0"
                      className="w-24 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200"
                    />
                    <span className="text-sm text-gray-500">marks</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Button */}
          <button
            onClick={addQuestion}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
          >
            <Plus size={18} />
            <span>Add Question</span>
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating Assignment...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Create Assignment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddQuestion;