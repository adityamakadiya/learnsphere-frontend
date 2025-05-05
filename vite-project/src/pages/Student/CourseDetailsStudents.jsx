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
  const [review, setReview] = useState(null);
  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    console.log(
      "CourseDetailsStudents: useEffect, authLoading:",
      authLoading,
      "user:",
      user
    );
    if (authLoading) {
      console.log("CourseDetailsStudents: Waiting for auth");
      return;
    }
    if (!user || user.role !== "Student") {
      console.log("CourseDetailsStudents: Redirecting to /login, user:", user);
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
          );
          const enrollmentsResponse = await api.get("/students/enrollments");
          const enrollments = enrollmentsResponse.data.data;
          console.log("CourseDetailsStudents: Enrollments:", enrollments);
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
          );
          const sessionsResponse = await api.get(
            `/students/courses/${courseId}/sessions`
          );
          sessionsData = sessionsResponse.data.data;
          console.log("CourseDetailsStudents: Sessions:", sessionsData);
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
          });
          const progressResponse = await api.get(
            `/progress/${user.id}/${courseId}`
          );
          const progressData = progressResponse.data;
          console.log("CourseDetailsStudents: Progress:", progressData);
          setProgress({
            completionPercentage: progressData.completionPercentage,
            completedSessions: progressData.completedSessions,
            totalSessions: progressData.totalSessions,
          });
          const completedResponse = await api.get(
            `/students/courses/${courseId}/progress`
          );
          const completedData = completedResponse.data.data;
          console.log(
            "CourseDetailsStudents: Completed sessions:",
            completedData
          );
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

        // Fetch user's review
        try {
          console.log(
            "CourseDetailsStudents: Fetching review for user:",
            user.id,
            "courseId:",
            courseId
          );
          const reviewResponse = await api.get(
            `/ratings/courses/${courseId}/user/${user.id}`
          );
          console.log("CourseDetailsStudents: Review:", reviewResponse.data);
          if (reviewResponse.data.data) {
            setReview(reviewResponse.data.data);
            setStars(reviewResponse.data.data.stars);
            setReviewText(reviewResponse.data.data.review || "");
          }
        } catch (reviewErr) {
          console.error(
            "CourseDetailsStudents: Failed to fetch review:",
            reviewErr.response?.status,
            reviewErr.response?.data || reviewErr.message
          );
          if (reviewErr.response?.status !== 404) {
            setReviewError("Could not load review data.");
          }
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
      );
      const response = await api.post(
        `/students/sessions/${sessionId}/complete`,
        {}
      );
      console.log(
        "CourseDetailsStudents: Mark complete response:",
        response.data
      );
      setCompletedSessionIds([...completedSessionIds, sessionId]);
      const progressResponse = await api.get(
        `/progress/${user.id}/${courseId}`
      );
      console.log(
        "CourseDetailsStudents: Updated progress:",
        progressResponse.data
      );
      setProgress({
        completionPercentage: progressResponse.data.completionPercentage,
        completedSessions: progressData.completedSessions,
        totalSessions: progressData.totalSessions,
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

  const handleStarClick = (star) => {
    setStars(star);
  };

  const handleReviewSubmit = async () => {
    if (review) {
      setReviewError("You have already submitted a review.");
      return;
    }
    if (stars < 1 || stars > 5) {
      setReviewError("Please select a star rating.");
      return;
    }
    if (reviewText.trim().length < 50) {
      setReviewError("Feedback must be at least 50 characters.");
      return;
    }
    setSubmittingReview(true);
    setReviewError("");
    try {
      console.log(
        "CourseDetailsStudents: Submitting review for courseId:",
        courseId,
        "userId:",
        user.id,
        "stars:",
        stars,
        "review:",
        reviewText
      );
      const response = await api.post(`/ratings/courses/${courseId}/ratings`, {
        userId: user.id,
        stars,
        review: reviewText.trim(),
      });
      console.log("CourseDetailsStudents: Review submitted:", response.data);
      setReview(response.data);
      setStars(0);
      setReviewText("");
      setReviewError("");
      alert("Review submitted successfully!");
    } catch (err) {
      console.error(
        "CourseDetailsStudents: Failed to submit review:",
        err.response?.status,
        err.response?.data || err.message
      );
      setReviewError(
        err.response?.data?.error ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderTipTapContent = (content) => {
    return (
      <div
        className="prose prose-sm max-w-none text-gray-600 line-clamp-3"
        dangerouslySetInnerHTML={{ __html: content || "No content available." }}
      />
    );
  };

  console.log(
    "CourseDetailsStudents: Render, authLoading:",
    authLoading,
    "user:",
    user
  );

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-700 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }
  if (!user || user.role !== "Student") {
    console.log("CourseDetailsStudents: Render redirect, user:", user);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-8">
          {course?.title || "Course Details"}
        </h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            {error.includes("Please try again") && (
              <button
                onClick={() => fetchCourseData()}
                className="text-sm text-red-700 underline hover:text-red-800 transition"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-600 animate-pulse">
            Loading course details...
          </div>
        ) : !course ? (
          <div className="text-center text-gray-600 text-lg">
            Course not found.
          </div>
        ) : (
          <div className="space-y-10">
            {/* Course Details */}
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

            {/* Progress Bar */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Your Progress
              </h3>
              {loading ? (
                <div className="w-full bg-gray-200 rounded-full h-4 animate-pulse"></div>
              ) : (
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${progress.completionPercentage}%` }}
                  ></div>
                </div>
              )}
              <p className="text-sm text-gray-600 mt-2">
                {progress.completedSessions} of {progress.totalSessions}{" "}
                sessions completed ({progress.completionPercentage.toFixed(2)}%)
              </p>
            </section>

            {/* Review Section */}
            <section className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Review
              </h3>
              {reviewError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
                  {reviewError}
                </div>
              )}
              {review ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-2xl ${
                            i < review.stars
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          aria-hidden="true"
                        >
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-gray-600 text-sm">
                        {review.stars.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      Submitted
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Feedback
                    </label>
                    <textarea
                      value={review.review || "No feedback provided."}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
                      rows="4"
                      aria-label="Your submitted feedback"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleStarClick(i + 1)}
                        className={`text-2xl focus:outline-none ${
                          i < stars ? "text-yellow-400" : "text-gray-300"
                        } hover:text-yellow-300 transition-colors`}
                        aria-label={`Rate ${i + 1} star${
                          i + 1 === 1 ? "" : "s"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    {stars > 0 && (
                      <span className="ml-2 text-gray-600 text-sm">
                        {stars.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="review-text"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Feedback
                    </label>
                    <textarea
                      id="review-text"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Write your feedback (minimum 50 characters)..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                      rows="4"
                      aria-label="Write your feedback"
                    />
                  </div>
                  <button
                    onClick={handleReviewSubmit}
                    disabled={submittingReview}
                    className={`w-full py-2.5 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                      submittingReview
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    }`}
                    aria-label="Submit review"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              )}
            </section>

            {/* Sessions List */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Sessions
              </h3>
              {sessions.length === 0 && !error ? (
                <div className="text-gray-600 text-center">
                  No sessions available.
                </div>
              ) : (
                <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-gradient-to-r from-gray-50 to-white p-8 rounded-2xl shadow-md border-l-4 border-green-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 animate-slide-up"
                      aria-describedby={`session-${session.id}-description`}
                    >
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">
                        {session.title}
                      </h4>
                      {session.youtubeUrl && (
                        <div className="mb-4 aspect-[16/9] w-full">
                          <iframe
                            src={session.youtubeUrl.replace(
                              "watch?v=",
                              "embed/"
                            )}
                            title={session.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full rounded-lg"
                          ></iframe>
                        </div>
                      )}
                      <div
                        id={`session-${session.id}-description`}
                        className="text-sm text-gray-600 mb-6 line-clamp-3"
                      >
                        {renderTipTapContent(session.content)}
                      </div>
                      <button
                        onClick={() => handleMarkComplete(session.id)}
                        disabled={completedSessionIds.includes(session.id)}
                        className={`mx-auto w-64 py-2.5 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                          completedSessionIds.includes(session.id)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        }`}
                        aria-label={
                          completedSessionIds.includes(session.id)
                            ? `Session ${session.title} completed`
                            : `Mark session ${session.title} as complete`
                        }
                      >
                        {completedSessionIds.includes(session.id)
                          ? "Completed"
                          : "Mark as Complete"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseDetailsStudents;
