const Accordion = ({ data }) => {
  const navigate = useNavigate(); // Navigation hook
  const { courseCode } = useParams();
  const [isOpen, setOpen] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
        onClick={() => setOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-medium text-gray-900">
            {data.assignmentName}
          </h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={16} className="mr-2" />
                <span>Start: {formatDate(data.startTime)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={16} className="mr-2" />
                <span>End: {formatDate(data.endTime)}</span>
              </div>
            </div>

            {data.isSubmitted ? (
              <div className="text-sm font-medium text-green-600">
                ✅ Assignment Attempted
              </div>
            ) : (
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                onClick={() =>
                  navigate(`/enrolled/${courseCode}/${data.assignmentId}`)
                }
              >
                Attempt Assignment
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
