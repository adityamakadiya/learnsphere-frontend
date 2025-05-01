import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import api from "../../api";
import "../../index.css";

function CourseDetailsStudents() {
  const { courseId } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [completedSessionIds, setCompletedSessionIds] = useState([]);
  const [progress, setProgress] = useState({
    completionPercentage: 0,
    completedSessions: 0,
    totalSessions: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log(
      "CourseDetailsStudents: useEffect, authLoading:",
      authLoading,
      "user:",
      user
    ); // Debug
    if (authLoading) {
      console.log("CourseDetailsStudents: Waiting for auth"); // Debug
      return;
    }
    if (!user || user.role !== "Student") {
      console.log("CourseDetailsStudents: Redirecting to /login, user:", user); // Debug
      navigate("/login", { replace: true });
      return;
    }

    const fetchCourseData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch enrolled courses to get course details
        let courseData = null;
        try {
          console.log(
            "CourseDetailsStudents: Fetching enrollments for user:",
            user.id
          ); // Debug
          const enrollmentsResponse = await api.get("/students/enrollments");
          const enrollments = enrollmentsResponse.data.data;
          console.log("CourseDetailsStudents: Enrollments:", enrollments); // Debug
          courseData = enrollments.find(
            (e) => e.course.id === parseInt(courseId)
          )?.course;
          if (!courseData) {
            setError("Course not found or you are not enrolled.");
            return;
          }
          setCourse(courseData);
        } catch (enrollErr) {
          console.error(
            "CourseDetailsStudents: Failed to fetch enrollments:",
            enrollErr.response?.status,
            enrollErr.response?.data || enrollErr.message
          );
          setError("Could not load course details. Please try again.");
          return;
        }

        // Fetch sessions
        let sessionsData = [];
        try {
          console.log(
            "CourseDetailsStudents: Fetching sessions for courseId:",
            courseId
          ); // Debug
          const sessionsResponse = await api.get(
            `/students/courses/${courseId}/sessions`
          );
          sessionsData = sessionsResponse.data.data;
          console.log("CourseDetailsStudents: Sessions:", sessionsData); // Debug
          setSessions(sessionsData);
          if (sessionsData.length === 0) {
            setError("No sessions available for this course.");
          }
        } catch (sessionErr) {
          console.error(
            "CourseDetailsStudents: Failed to fetch sessions:",
            sessionErr.response?.status,
            sessionErr.response?.data || sessionErr.message
          );
          if (sessionErr.response?.status === 403) {
            setError("You are not enrolled in this course.");
          } else if (sessionErr.response?.status === 404) {
            setError("Course not found.");
          } else {
            setError("Could not load sessions. Please try again later.");
          }
          return;
        }

        // Fetch progress
        try {
          console.log("CourseDetailsStudents: Fetching progress for:", {
            userId: user.id,
            courseId,
          }); // Debug
          const progressResponse = await api.get(
            `/progress/${user.id}/${courseId}`
          );
          const progressData = progressResponse.data;
          console.log("CourseDetailsStudents: Progress:", progressData); // Debug
          setProgress({
            completionPercentage: progressData.completionPercentage,
            completedSessions: progressData.completedSessions,
            totalSessions: progressData.totalSessions,
          });
          // Fetch completed session IDs
          console.log(
            "CourseDetailsStudents: Fetching completed sessions for courseId:",
            courseId
          ); // Debug
          const completedResponse = await api.get(
            `/students/courses/${courseId}/progress`
          );
          const completedData = completedResponse.data.data;
          console.log(
            "CourseDetailsStudents: Completed sessions:",
            completedData
          ); // Debug
          setCompletedSessionIds(
            completedData.filter((p) => p.completed).map((p) => p.sessionId)
          );
        } catch (progressErr) {
          console.error(
            "CourseDetailsStudents: Failed to fetch progress:",
            progressErr.response?.status,
            progressErr.response?.data || progressErr.message
          );
          setError("Could not load progress data. Showing 0% progress.");
          setProgress({
            completionPercentage: 0,
            completedSessions: 0,
            totalSessions: sessionsData.length || 0,
          });
        }
      } catch (err) {
        console.error(
          "CourseDetailsStudents: General error:",
          err.response?.status,
          err.response?.data || err.message
        );
        setError("Failed to load course data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [user, authLoading, navigate, courseId]);

  const handleMarkComplete = async (sessionId) => {
    try {
      console.log(
        "CourseDetailsStudents: Marking session complete:",
        sessionId
      ); // Debug
      const response = await api.post(
        `/students/sessions/${sessionId}/complete`,
        {}
      );
      console.log(
        "CourseDetailsStudents: Mark complete response:",
        response.data
      ); // Debug
      setCompletedSessionIds([...completedSessionIds, sessionId]);
      // Refresh progress
      const progressResponse = await api.get(
        `/progress/${user.id}/${courseId}`
      );
      console.log(
        "CourseDetailsStudents: Updated progress:",
        progressResponse.data
      ); // Debug
      setProgress({
        completionPercentage: progressResponse.data.completionPercentage,
        completedSessions: progressResponse.data.completedSessions,
        totalSessions: progressResponse.data.totalSessions,
      });
      alert("Session marked as complete!");
    } catch (err) {
      console.error(
        "CourseDetailsStudents: Failed to mark complete:",
        err.response?.status,
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
    return (
      <div
        dangerouslySetInnerHTML={{ __html: content || "No content available." }}
      />
    );
  };

  console.log(
    "CourseDetailsStudents: Render, authLoading:",
    authLoading,
    "user:",
    user
  ); // Debug

  if (authLoading) {
    return <div className="text-center text-gray-700 text-lg">Loading...</div>;
  }
  if (!user || user.role !== "Student") {
    console.log("CourseDetailsStudents: Render redirect, user:", user); // Debug
    return null; // Handled by useEffect redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          {course?.title || "Course Details"}
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
            {error.includes("Please try again") && (
              <button
                onClick={() => fetchCourseData()}
                className="ml-4 text-sm text-red-700 underline"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-600">
            Loading course details...
          </div>
        ) : !course ? (
          <div className="text-center text-gray-600">Course not found.</div>
        ) : (
          <div>
            {/* Course Details */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {course.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {course.description || "No description available."}
              </p>
              <p className="text-gray-500 text-sm">
                Category: {course.category?.name || "Unknown"}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your Progress
              </h3>
              {loading ? (
                <div className="w-full bg-gray-200 rounded-full h-4 animate-pulse"></div>
              ) : (
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${progress.completionPercentage}%` }}
                  ></div>
                </div>
              )}
              <p className="text-sm text-gray-600 mt-2">
                {progress.completedSessions} of {progress.totalSessions}{" "}
                sessions completed ({progress.completionPercentage.toFixed(2)}%)
              </p>
            </div>

            {/* Sessions List */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sessions
            </h3>
            {sessions.length === 0 && !error ? (
              <div className="text-gray-600">No sessions available.</div>
            ) : (
              <div className="space-y-6">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200"
                  >
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
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
                    <div className="text-gray-600 mb-4 prose">
                      {renderTipTapContent(session.content)}
                    </div>
                    <button
                      onClick={() => handleMarkComplete(session.id)}
                      disabled={completedSessionIds.includes(session.id)}
                      className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors duration-200 ${
                        completedSessionIds.includes(session.id)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {completedSessionIds.includes(session.id)
                        ? "Completed"
                        : "Mark as Complete"}
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