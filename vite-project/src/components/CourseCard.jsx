import StarRating from "./StarRating";

const CourseCard = ({ course, isEnrolled, onEnroll }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition aspect-square flex flex-col">
      <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">
        {course.title}
      </h2>
      <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
        {course.description || "No description available."}
      </p>
      <p className="text-gray-500 text-sm mb-2">
        Category: {course.category?.name || "Unknown"}
      </p>
      <div className="flex items-center mb-2">
        <StarRating rating={course.averageRating || 0} />
        <span className="ml-2 text-gray-600 text-sm">
          {(course.averageRating || 0).toFixed(1)}
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-4">
        {course.ratingCount || 0}{" "}
        {course.ratingCount === 1 ? "review" : "reviews"}
      </p>
      {onEnroll && (
        <button
          onClick={() => onEnroll(course.id)}
          disabled={isEnrolled}
          className={`w-full py-2 rounded-lg text-white font-medium transition ${
            isEnrolled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isEnrolled ? "Enrolled" : "Enroll"}
        </button>
      )}
    </div>
  );
};

export default CourseCard;
