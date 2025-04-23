import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";

function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== "Instructor")) {
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
        setError("Failed to fetch courses :", err.massage);
        if (err.response?.status === 401) {
          logout();
        }
      }
    };
    fetchCourses();
  }, [user, navigate, logout]);

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(courses.filter((course) => course.id !== courseId));
      } catch (err) {
        setError("Failed to delete course : ", err.massage);
      }
    }
  };

  if (!user || user.role !== "Instructor") return null;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Instructor Dashboard
            </h2>
            <button
              onClick={logout}
              className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
          <Link
            to="/instructor/courses/new"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition mb-6"
          >
            Create New Course
          </Link>
          {error && (
            <p className="text-red-500 text-center mb-4 font-medium">{error}</p>
          )}
          {courses.length === 0 ? (
            <p className="text-gray-700 text-center">No courses found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">
                      Title
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b">
                      <td className="p-3 text-gray-800">{course.title}</td>
                      <td className="p-3 text-gray-800">
                        {course.description}
                      </td>
                      <td className="p-3 text-gray-800">
                        {course.category.name}
                      </td>
                      <td className="p-3 flex space-x-2">
                        <Link
                          to={`/instructor/courses/edit/${course.id}`}
                          className="bg-gray-600 text-white py-1 px-3 rounded-lg text-sm hover:bg-gray-700 transition"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/instructor/courses/${course.id}/sessions/new`}
                          className="bg-gray-600 text-white py-1 px-3 rounded-lg text-sm hover:bg-gray-700 transition"
                        >
                          Add Session
                        </Link>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="bg-red-600 text-white py-1 px-3 rounded-lg text-sm hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorDashboard;
