import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import api from "../../api";
import CourseHeader from "../../components/CourseHeader";
import CourseInfo from "../../components/CourseInfo";
import ProgressBar from "../../components/ProgressBar";
import CourseReviews from "../../components/CourseReviews";
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
  const [courseReviews, setCourseReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "Student") {
      navigate("/login", { replace: true });
      return;
    }

    const fetchCourseData = async () => {
      setLoading(true);
      setError("");
      try {
        const enrollmentsResponse = await api.get("/students/enrollments");
        const courseData = enrollmentsResponse.data.data.find(
          (e) => e.course.id === parseInt(courseId)
        )?.course;
        if (!courseData) {
          setError("Course not found or you are not enrolled.");
          return;
        }
        setCourse(courseData);

        const sessionsResponse = await api.get(
          `/students/courses/${courseId}/sessions`
        );
        const sessionsData = sessionsResponse.data.data;
        setSessions(sessionsData);
        if (sessionsData.length === 0) {
          setError("No sessions available for this course.");
        }

        const progressResponse = await api.get(
          `/progress/${user.id}/${courseId}`
        );
        const progressData = progressResponse.data;
        setProgress({
          completionPercentage: progressData.completionPercentage,
          completedSessions: progressData.completedSessions,
          totalSessions: progressData.totalSessions,
        });

        const completedResponse = await api.get(
          `/students/courses/${courseId}/progress`
        );
        setCompletedSessionIds(
          completedResponse.data.data
            .filter((p) => p.completed)
            .map((p) => p.sessionId)
        );

        try {
          const reviewResponse = await api.get(
            `/ratings/courses/${courseId}/user/${user.id}`
          );
          if (reviewResponse.data.data) {
            setReview(reviewResponse.data.data);
            setStars(reviewResponse.data.data.stars);
            setReviewText(reviewResponse.data.data.review || "");
          } else {
            setReview(null);
          }
        } catch (reviewErr) {
          if (reviewErr.response?.status === 404) {
            setReview(null);
          } else {
            const errorMsg =
              reviewErr.response?.data?.error ||
              "Unable to fetch review data. Please try again.";
            setError(errorMsg);
          }
        }

        try {
          const reviewsResponse = await api.get(
            `/ratings/courses/${courseId}/ratings`
          );
          setCourseReviews(reviewsResponse.data.ratings || []);
          setAverageRating(reviewsResponse.data.averageRating || 0);
          setRatingCount(reviewsResponse.data.ratingCount || 0);
        } catch (reviewsErr) {
          setError("Failed to load course reviews.");
        }
      } catch (err) {
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
      await api.post(`/students/sessions/${sessionId}/complete`, {});
      setCompletedSessionIds([...completedSessionIds, sessionId]);
      const progressResponse = await api.get(
        `/progress/${user.id}/${courseId}`
      );
      setProgress({
        completionPercentage: progressResponse.data.completionPercentage,
        completedSessions: progressResponse.data.completedSessions,
        totalSessions: progressData.totalSessions,
      });
      alert("Session marked as complete!");
    } catch (err) {
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
      const response = await api.post(`/ratings/courses/${courseId}/ratings`, {
        stars,
        review: reviewText.trim(),
      });
      setReview(response.data);
      setCourseReviews([
        ...courseReviews,
        { ...response.data, user: { email: user.email } },
      ]);
      setAverageRating(
        (
          (averageRating * ratingCount + response.data.stars) /
          (ratingCount + 1)
        ).toFixed(1)
      );
      setRatingCount(ratingCount + 1);
      setStars(0);
      setReviewText("");
      alert("Review submitted successfully!");
    } catch (err) {
      setReviewError(err.response?.data?.error || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-gray-700 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }
  if (!user || user.role !== "Student") return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 animate-fade-in">
          <CourseHeader
            course={course}
            error={error}
            fetchCourseData={() => {}}
          />
          {loading ? (
            <div className="text-center text-gray-600 animate-pulse">
              Loading...
            </div>
          ) : !course ? (
            <div className="text-center text-gray-600 text-base">
              Course not found.
            </div>
          ) : (
            <div className="space-y-6">
              <CourseInfo course={course} />
              <ProgressBar loading={loading} progress={progress} />
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
                Sessions
              </h3>
              {sessions.length === 0 && !error ? (
                <div className="text-gray-600 text-center">
                  No sessions available.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
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

          <div className="lg:col-span-1">
            <CourseReviews
              courseId={courseId}
              review={review}
              courseReviews={courseReviews}
              averageRating={averageRating}
              ratingCount={ratingCount}
              stars={stars}
              setStars={setStars}
              reviewText={reviewText}
              setReviewText={setReviewText}
              reviewError={reviewError}
              submittingReview={submittingReview}
              handleReviewSubmit={handleReviewSubmit}
              userEmail={user.email}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailsStudents;
