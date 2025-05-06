import { useCallback } from "react";

const CourseHeader = ({ course, error, fetchCourseData }) => {
  const handleRetry = useCallback(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  return (
    <>
      <h1 className="text-4xl font-bold text-gray-900 text-center mb-8">
        {course?.title || "Course Details"}
      </h1>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          {error.includes("Please try again") && (
            <button
              onClick={handleRetry}
              className="text-sm text-red-700 underline hover:text-red-800 transition"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default CourseHeader;
