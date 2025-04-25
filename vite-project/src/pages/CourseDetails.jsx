import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import "../index.css";

function CourseDetails() {
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const { courseId } = useParams();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "Instructor") {
      navigate("/");
      return;
    }

    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");
        const courseResponse = await axios.get(
          `http://localhost:5000/courses/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourse(courseResponse.data.data);
      } catch (err) {
        setError(`Failed to fetch data: ${err.message}`);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setIsFetching(false);
      }
    };
    fetchCourse();
  }, [courseId, user, navigate, loading]);

  if (loading || !user || user.role !== "Instructor") return null;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-10 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800">Course Details</h2>
            <Link
              to="/instructor-dashboard"
              className="bg-gray-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </Link>
          </div>
          {error && (
            <p className="text-red-500 text-center mb-6 font-medium">{error}</p>
          )}
          {isFetching ? (
            <div className="text-center text-gray-700 text-lg">Loading...</div>
          ) : !course ? (
            <p className="text-gray-700 text-center text-lg">
              Course not found.
            </p>
          ) : (
            <>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Title</h3>
                  <p className="text-gray-600 mt-2">{course.title}</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Description
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {course.description || "No description provided."}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Category
                  </h3>
                  <p className="text-gray-600 mt-2">{course.category.name}</p>
                </div>
                <div className="flex justify-end gap-4">
                  <Link
                    to={`/instructor/courses/edit/${courseId}`}
                    className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Edit Course
                  </Link>
                  <Link
                    to={`/instructor/courses/${courseId}/sessions`}
                    className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Manage Session
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
