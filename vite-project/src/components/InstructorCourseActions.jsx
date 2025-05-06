import { Link } from "react-router-dom";

const InstructorCourseActions = ({ courseId }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-3xl font-bold text-gray-900">Course Details</h2>
      <div className="flex gap-4">
        <Link
          to={`/instructor/courses/edit/${courseId}`}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Edit Course
        </Link>
        <Link
          to={`/instructor/courses/${courseId}/sessions`}
          className="bg-green-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Manage Sessions
        </Link>
        <Link
          to="/instructor-dashboard"
          className="bg-gray-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 transition"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default InstructorCourseActions;
