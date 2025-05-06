import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../api"; // Use api.js for cookie-based auth
import "../index.css";

function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "Instructor") {
      console.log("InstructorDashboard: Redirecting to /, user:", user); // Debug
      navigate("/");
      return;
    }

    const fetchCourses = async () => {
      try {
        console.log("InstructorDashboard: Fetching courses for user:", user.id); // Debug
        const response = await api.get("/courses/instructor");
        console.log("InstructorDashboard: Courses response:", response.data); // Debug
        setCourses(response.data.data);
      } catch (err) {
        console.error(
          "InstructorDashboard: Failed to fetch courses:",
          err.response?.status,
          err.response?.data || err.message
        );
        setError(
          `Failed to fetch courses: ${err.response?.data?.error || err.message}`
        );
        if (err.response?.status === 401) {
          console.log("InstructorDashboard: 401 detected, triggering logout"); // Debug
          logout();
        }
      } finally {
        setIsFetching(false);
      }
    };
    fetchCourses();
  }, [user, navigate, loading, logout]);

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        console.log("InstructorDashboard: Deleting courseId:", courseId); // Debug
        await api.delete(`/courses/${courseId}`);
        console.log("InstructorDashboard: Course deleted:", courseId); // Debug
        setCourses(courses.filter((course) => course.id !== courseId));
      } catch (err) {
        console.error(
          "InstructorDashboard: Failed to delete course:",
          err.response?.status,
          err.response?.data || err.message
        );
        setError(
          `Failed to delete course: ${err.response?.data?.error || err.message}`
        );
      }
    }
  };

  if (loading || !user || user.role !== "Instructor") return null;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white p-10 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-bold text-gray-800">
              Instructor Dashboard
            </h2>
            <Link
              to="/instructor/courses/new"
              className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Create Course
            </Link>
          </div>
          {error && (
            <p className="text-red-500 text-center mb-6 font-medium">{error}</p>
          )}
          {isFetching ? (
            <div className="text-center text-gray-700 text-lg">
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <p className="text-gray-700 text-center text-lg">
              No courses found. Start by creating one!
            </p>
          ) : (
            <div className="space-y-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-gray-50 p-8 rounded-lg shadow-md flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mt-2 max-w-2xl">
                      {course.description}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Category: {course.category?.name || "Unknown"}
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <Link
                      to={`/instructor/courses/${course.id}`}
                      className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Manage Course
                    </Link>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorDashboard;

