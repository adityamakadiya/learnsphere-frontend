import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../api"; // Use api.js with cookie-based auth
import "../index.css";

function CourseDetails() {
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const { courseId } = useParams();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      console.log("CourseDetails: Waiting for auth to load"); // Debug
      return;
    }
    if (!user || user.role !== "Instructor") {
      console.log("CourseDetails: Redirecting to /login, user:", user); // Debug
      navigate("/login"); // Redirect to login
      return;
    }

    const fetchCourseData = async () => {
      setIsFetching(true);
      setError("");
      try {
        console.log(
          "CourseDetails: Fetching data for courseId:",
          courseId,
          "user:",
          user.id
        ); // Debug

        // Fetch course details
        try {
          const courseResponse = await api.get(`/courses/${courseId}`);
          console.log("CourseDetails: Course response:", courseResponse.data); // Debug
          setCourse(courseResponse.data.data);
        } catch (err) {
          console.error(
            "CourseDetails: Failed to fetch course:",
            err.response?.status,
            err.response?.data || err.message
          );
          setError(
            `Failed to fetch course data: ${
              err.response?.data?.error || err.message
            }`
          );
          if (err.response?.status === 401) {
            console.log("CourseDetails: 401 detected, redirecting to /login"); // Debug
            navigate("/login");
          }
          return;
        }

        // Fetch enrollments with progress
        try {
          const enrollmentsResponse = await api.get(
            `/progress/courses/${courseId}/enrollments`
          );
          console.log(
            "CourseDetails: Enrollments response:",
            enrollmentsResponse.data
          ); // Debug
          setEnrollments(enrollmentsResponse.data || []);
        } catch (enrollErr) {
          console.error(
            "CourseDetails: Failed to fetch enrollments:",
            enrollErr.response?.status,
            enrollErr.response?.data || enrollErr.message
          );
          setError("Could not load enrolled students.");
        }
      } catch (err) {
        console.error(
          "CourseDetails: General error:",
          err.response?.status,
          err.response?.data || err.message
        );
        setError("Failed to load data.");
        if (err.response?.status === 401) {
          console.log("CourseDetails: 401 detected, redirecting to /login"); // Debug
          navigate("/login");
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchCourseData();
  }, [courseId, user, navigate, loading]);

  const handleRemoveStudent = async (enrollmentId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this student from the course?"
      )
    ) {
      return;
    }

    try {
      console.log("CourseDetails: Removing enrollmentId:", enrollmentId); // Debug
      await api.delete(`/progress/enrollments/${enrollmentId}`);
      console.log("CourseDetails: Enrollment deleted:", enrollmentId); // Debug
      setEnrollments(
        enrollments.filter((enrollment) => enrollment.id !== enrollmentId)
      );
      alert("Student removed successfully!");
    } catch (err) {
      console.error(
        "CourseDetails: Failed to remove student:",
        err.response?.status,
        err.response?.data || err.message
      );
      alert(err.response?.data?.error || "Failed to remove student.");
    }
  };

  if (loading) {
    return <div className="text-center text-gray-700 text-lg">Loading...</div>;
  }
  if (!user || user.role !== "Instructor") {
    return null; // Handled by useEffect redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Course Details</h2>
            <Link
              to="/instructor-dashboard" // Match dashboard route
              className="bg-gray-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </Link>
          </div>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              {error}
              <button
                onClick={() => fetchCourseData()}
                className="ml-4 text-sm text-red-700 underline"
              >
                Retry
              </button>
            </div>
          )}
          {isFetching ? (
            <div className="text-center text-gray-600 text-lg">Loading...</div>
          ) : !course ? (
            <div className="text-center text-gray-600 text-lg">
              Course not found.
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Title</h3>
                  <p className="text-gray-600 mt-2">{course.title}</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Description
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {course.description || "No description provided."}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Category
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {course.category?.name || "Unknown"}
                  </p>
                </div>
                <div className="flex justify-end gap-4">
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
                </div>
              </div>

              {/* Enrolled Students */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Enrolled Students
                </h3>
                {enrollments.length === 0 ? (
                  <div className="text-gray-600 text-center">
                    No students enrolled.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 text-left text-gray-900 font-semibold">
                            Student Email
                          </th>
                          <th className="px-4 py-2 text-left text-gray-900 font-semibold">
                            Progress
                          </th>
                          <th className="px-4 py-2 text-left text-gray-900 font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((enrollment) => (
                          <tr
                            key={enrollment.id}
                            className="border-b border-gray-200"
                          >
                            <td className="px-4 py-3 text-gray-600">
                              {enrollment.user?.email || "Unknown"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${
                                      enrollment.progress
                                        ?.completionPercentage || 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {enrollment.progress?.completedSessions || 0} of{" "}
                                {enrollment.progress?.totalSessions || 0}{" "}
                                sessions completed (
                                {(
                                  enrollment.progress?.completionPercentage || 0
                                ).toFixed(2)}
                                %)
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() =>
                                  handleRemoveStudent(enrollment.id)
                                }
                                className="bg-red-600 text-white py-1 px-4 rounded-lg font-semibold hover:bg-red-700 transition"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
