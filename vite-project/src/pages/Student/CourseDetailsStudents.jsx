import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import api from "../../api";
import CourseHeader from "../../components/CourseHeader";
import CourseInfo from "../../components/CourseInfo";
import ProgressBar from "../../components/ProgressBar";
import ReviewForm from "../../components/ReviewForm";
import SessionCard from "../../components/SessionCard";
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
        // Fetch enrolled courses
        const enrollmentsResponse = await api.get("/students/enrollments");
        console.log(
          "CourseDetailsStudents: Enrollments:",
          enrollmentsResponse.data.data
        );
        const courseData = enrollmentsResponse.data.data.find(
          (e) => e.course.id === parseInt(courseId)
        )?.course;
        if (!courseData) {
          setError("Course not found or you are not enrolled.");
          return;
        }
        setCourse(courseData);

        // Fetch sessions
        const sessionsResponse = await api.get(
          `/students/courses/${courseId}/sessions`
        );
        const sessionsData = sessionsResponse.data.data;
        console.log("CourseDetailsStudents: Sessions:", sessionsData);
        setSessions(sessionsData);
        if (sessionsData.length === 0) {
          setError("No sessions available for this course.");
        }

        // Fetch progress
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

        // Fetch user's review
        const reviewResponse = await api.get(
          `/ratings/courses/${courseId}/user/${user.id}`
        );
        console.log("CourseDetailsStudents: Review:", reviewResponse.data);
        if (reviewResponse.data.data) {
          setReview(reviewResponse.data.data);
          setStars(reviewResponse.data.data.stars);
          setReviewText(reviewResponse.data.data.review || "");
        }
      } catch (err) {
        console.error(
          "CourseDetailsStudents: Error:",
          err.response?.data || err.message
        );
        const errorMessage =
          err.response?.status === 403
            ? "You are not enrolled in this course."
            : err.response?.status === 404
            ? "Course not found."
            : "Could not load course data. Please try again.";
        setError(errorMessage);
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
        completedSessions: progressResponse.data.completedSessions,
        totalSessions: progressResponse.data.totalSessions,
      });
      alert("Session marked as complete!");
    } catch (err) {
      console.error(
        "CourseDetailsStudents: Failed to mark complete:",
        err.response?.data
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
      console.log("CourseDetailsStudents: Submitting review:", {
        stars,
        reviewText,
      });
      const response = await api.post(`/ratings/courses/${courseId}/ratings`, {
        userId: user.id,
        stars,
        review: reviewText.trim(),
      });
      console.log("CourseDetailsStudents: Review submitted:", response.data);
      setReview(response.data);
      setStars(0);
      setReviewText("");
      alert("Review submitted successfully!");
    } catch (err) {
      console.error(
        "CourseDetailsStudents: Failed to submit review:",
        err.response?.data
      );
      setReviewError(err.response?.data?.error || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

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
        <CourseHeader
          course={course}
          error={error}
          fetchCourseData={() => {}}
        />
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
            <CourseInfo course={course} />
            <ProgressBar loading={loading} progress={progress} />
            <ReviewForm
              review={review}
              stars={stars}
              setStars={setStars}
              reviewText={reviewText}
              setReviewText={setReviewText}
              reviewError={reviewError}
              submittingReview={submittingReview}
              handleReviewSubmit={handleReviewSubmit}
              courseId={courseId}
            />
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
                    <SessionCard
                      key={session.id}
                      session={session}
                      completedSessionIds={completedSessionIds}
                      handleMarkComplete={handleMarkComplete}
                    />
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
