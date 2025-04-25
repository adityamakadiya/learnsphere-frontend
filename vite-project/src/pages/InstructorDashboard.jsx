import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import "../index.css";

function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "Instructor") {
      navigate("/");
      return;
    }

    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/courses/instructor",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCourses(response.data.data);
      } catch (err) {
        setError(`Failed to fetch courses: ${err.message}`);
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setIsFetching(false);
      }
    };
    fetchCourses();
  }, [user, navigate, logout, loading]);

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(courses.filter((course) => course.id !== courseId));
      } catch (err) {
        setError(`Failed to delete course: ${err.message}`);
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
            <button
              onClick={logout}
              className="bg-red-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
          <Link
            to="/instructor/courses/new"
            className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition mb-10"
          >
            Create New Course
          </Link>
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
                      Category: {course.category.name}
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
