import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import "../../index.css";

function CourseDetailsStudents() {
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [completedSessionIds, setCompletedSessionIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "Student") {
      navigate("/login");
      return;
    }

    const fetchCourseData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch enrolled courses to get course details
        let courseData = null;
        try {
          const enrollmentsResponse = await axios.get(
            "http://localhost:5000/students/enrollments",
            { headers }
          );
          const enrollments = enrollmentsResponse.data.data;
          console.log("Enrollments:", enrollments);
          courseData = enrollments.find(
            (e) => e.course.id === parseInt(courseId)
          )?.course;
          if (!courseData) {
            setError("Course not found or not enrolled.");
            return;
          }
          setCourse(courseData);
        } catch (enrollErr) {
          console.error(
            "Failed to fetch enrollments:",
            enrollErr.response?.data || enrollErr.message
          );
          setError("Could not load course details.");
          return;
        }

        // Fetch sessions
        try {
          const sessionsResponse = await axios.get(
            `http://localhost:5000/students/courses/${courseId}/sessions`,
            { headers }
          );
          const sessionsData = sessionsResponse.data.data;
          console.log("Sessions:", sessionsData);
          setSessions(sessionsData);
        } catch (sessionErr) {
          console.error(
            "Failed to fetch sessions:",
            sessionErr.response?.data || sessionErr.message
          );
          setError("Could not load sessions.");
          if (sessionErr.response?.status === 403) {
            setError("You are not enrolled in this course.");
          }
        }

        // Fetch completed sessions (via progress table or separate API if available)
        try {
          const progressResponse = await axios.get(
            `http://localhost:5000/students/courses/${courseId}/progress`,
            { headers }
          );
          const progressData = progressResponse.data.data;
          console.log("Progress:", progressData);
          setCompletedSessionIds(
            progressData.filter((p) => p.completed).map((p) => p.sessionId)
          );
        } catch (progressErr) {
          console.error(
            "Failed to fetch progress:",
            progressErr.response?.data || progressErr.message
          );
          // Fallback: assume no progress API, rely on mark complete response
        }
      } catch (err) {
        console.error("General error:", err.response?.data || err.message);
        setError("Failed to load course data.");
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [user, navigate, courseId]);

  const handleMarkComplete = async (sessionId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/sessions/${sessionId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Mark Complete:", response.data);
      setCompletedSessionIds([...completedSessionIds, sessionId]);
      alert("Session marked as complete!");
    } catch (err) {
      console.error(
        "Failed to mark complete:",
        err.response?.data || err.message
      );
      const errorMsg =
        err.response?.data?.error || "Failed to mark session complete.";
      alert(errorMsg);
      if (
        err.response?.status === 400 &&
        err.response.data.error === "Session already completed"
      ) {
        setCompletedSessionIds([...completedSessionIds, sessionId]);
      }
    }
  };

  const renderTipTapContent = (content) => {
    // Placeholder: Convert TipTap JSON to HTML
    // Use @tiptap/react or a custom parser for production
    return (
      <div
        dangerouslySetInnerHTML={{ __html: content || "No content available." }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">
          Course Details Student
        </h1>
        {error && (
          <p className="text-red-500 text-center mb-6 font-medium">{error}</p>
        )}
        {loading ? (
          <p className="text-gray-600 text-center">Loading course details...</p>
        ) : !course ? (
          <p className="text-gray-600 text-center">Course not found.</p>
        ) : (
          <div>
            {/* Course Details */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {course.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {course.description || "No description available."}
              </p>
              <p className="text-gray-500 text-sm">
                Category: {course.category?.name || "Unknown"}
              </p>
            </div>

            {/* Sessions List */}
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Sessions
            </h3>
            {sessions.length === 0 ? (
              <p className="text-gray-600">No sessions available.</p>
            ) : (
              <div className="space-y-6">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200"
                  >
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      {session.title}
                    </h4>
                    {session.youtubeUrl && (
                      <div className="mb-4">
                        <iframe
                          width="100%"
                          height="315"
                          src={session.youtubeUrl.replace("watch?v=", "embed/")}
                          title={session.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-lg"
                        ></iframe>
                      </div>
                    )}
                    <div className="text-gray-600 mb-4">
                      {renderTipTapContent(session.content)}
                    </div>
                    <button
                      onClick={() => handleMarkComplete(session.id)}
                      disabled={completedSessionIds.includes(session.id)}
                      className={`w-full py-2 rounded-lg text-white font-medium transition ${
                        completedSessionIds.includes(session.id)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {completedSessionIds.includes(session.id)
                        ? "Completed"
                        : "Mark Complete"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseDetailsStudents;
