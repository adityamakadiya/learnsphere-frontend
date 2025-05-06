const CourseInfo = ({ course }) => {
  return (
    <section className="bg-gray-50 p-6 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        {course.title}
      </h2>
      <p className="text-gray-600 mb-4 leading-relaxed">
        {course.description || "No description available."}
      </p>
      <p className="text-gray-500 text-sm">
        Category:{" "}
        <span className="font-medium">
          {course.category?.name || "Unknown"}
        </span>
      </p>
    </section>
  );
};

export default CourseInfo;
