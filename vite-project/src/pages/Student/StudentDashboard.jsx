import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import api from "../../api";
import "../../index.css";

function StudentDashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // console.log(
    //   "StudentDashboard: useEffect, authLoading:",
    //   authLoading,
    //   "user:",
    //   user
    // ); // Debug
    if (authLoading) {
      // console.log("StudentDashboard: Waiting for auth");
      return;
    }
    if (!user || user.role !== "Student") {
      // console.log("StudentDashboard: Redirecting to /login, user:", user);
      navigate("/login", { replace: true });
      return;
    }

    const fetchEnrolledCourses = async () => {
      setLoading(true);
      setError("");
      try {
        // console.log("StudentDashboard: Fetching enrollments"); // Debug
        const response = await api.get("/students/enrollments");
        const enrollments = response.data.data;
        // console.log("StudentDashboard: Enrolled Courses:", enrollments);
        setEnrolledCourses(enrollments.map((e) => e.course));
      } catch (err) {
        console.error(
          "StudentDashboard: Failed to fetch enrolled courses:",
          err.response?.status,
          err.response?.data || err.message
        );
        setError("Could not load enrolled courses.");
        if (err.response?.status === 401) {
          // console.log("StudentDashboard: 401, redirecting to /login");
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user, authLoading, navigate]);

  // console.log(
  //   "StudentDashboard: Render, authLoading:",
  //   authLoading,
  //   "user:",
  //   user
  // ); // Debug

  if (authLoading) {
    return <div className="text-center text-gray-700 text-lg">Loading...</div>;
  }
  if (!user || user.role !== "Student") {
    // console.log("StudentDashboard: Render redirect, user:", user); // Debug
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">
          My Enrolled Courses
        </h1>
        {error && (
          <p className="text-red-500 text-center mb-6 font-medium">{error}</p>
        )}
        {loading ? (
          <p className="text-gray-600 text-center">
            Loading enrolled courses...
          </p>
        ) : enrolledCourses.length === 0 ? (
          <p className="text-gray-600 text-center">
            You are not enrolled in any courses. Browse courses to enroll!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition aspect-square flex flex-col"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                  {course.title}
                </h2>
                <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                  {course.description || "No description available."}
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Category: {course.category?.name || "Unknown"}
                </p>
                <button
                  onClick={() => navigate(`/students/courses/${course.id}`)}
                  className="w-full py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 transition"
                >
                  View Course
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;