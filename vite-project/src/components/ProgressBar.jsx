const ProgressBar = ({ loading, progress }) => {
  return (
    <section>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        Your Progress
      </h3>
      {loading ? (
        <div className="w-full bg-gray-200 rounded-full h-4 animate-pulse"></div>
      ) : (
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progress.completionPercentage}%` }}
          ></div>
        </div>
      )}
      <p className="text-sm text-gray-600 mt-2">
        {progress.completedSessions} of {progress.totalSessions} sessions
        completed ({progress.completionPercentage.toFixed(2)}%)
      </p>
    </section>
  );
};

export default ProgressBar;
