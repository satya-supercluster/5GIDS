function MitigationPanel({ mitigation,isLoading }) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">
        Recommended Mitigation
      </h3>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <svg
            className="animate-spin h-8 w-8 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      ) : (
        <div className="bg-green-900 p-4 rounded-md text-green-300 whitespace-pre-wrap">
          {mitigation}
        </div>
      )}
    </div>
  );
}

export default MitigationPanel;
