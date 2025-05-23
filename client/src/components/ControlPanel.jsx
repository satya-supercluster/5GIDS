function ControlPanel({ introduceAnomaly, clearData, loading }) {
  return (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={introduceAnomaly}
        disabled={loading}
        className={`bg-red-800 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex-1 flex items-center justify-center ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          "Trigger Anomaly"
        )}
      </button>
      <button
        onClick={clearData}
        className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex-1"
      >
        Clear
      </button>
    </div>
  );
}

export default ControlPanel;
