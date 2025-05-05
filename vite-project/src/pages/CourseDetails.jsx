import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../api";
import "../index.css";

function CourseDetails() {
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [comments, setComments] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const { courseId } = useParams();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      console.log("CourseDetails: Waiting for auth to load");
      return;
    }
    if (!user || user.role !== "Instructor") {
      console.log("CourseDetails: Redirecting to /login, user:", user);
      navigate("/login");
      return;
    }
    console.log(
      "CourseDetails: Instructor userId:",
      user.id,
      "role:",
      user.role
    );

    const fetchCourseData = async () => {
      setIsFetching(true);
      setError("");
      try {
        console.log(
          "CourseDetails: Fetching data for courseId:",
          courseId,
          "user:",
          user.id
        );

        // Fetch course details
        try {
          const courseResponse = await api.get(`/courses/${courseId}`);
          console.log("CourseDetails: Course response:", courseResponse.data);
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
            console.log("CourseDetails: 401 detected, redirecting to /login");
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
          );
          setEnrollments(enrollmentsResponse.data || []);
        } catch (enrollErr) {
          console.error(
            "CourseDetails: Failed to fetch enrollments:",
            enrollErr.response?.status,
            enrollErr.response?.data || enrollErr.message
          );
          setError("Could not load enrolled students.");
        }

        // Fetch ratings for the course
        try {
          const ratingsResponse = await api.get(
            `/ratings/courses/${courseId}/ratings`
          );
          console.log(
            "CourseDetails: Ratings response:",
            JSON.stringify(ratingsResponse.data, null, 2)
          );
          const fetchedRatings = Array.isArray(ratingsResponse.data.ratings)
            ? ratingsResponse.data.ratings
            : Array.isArray(ratingsResponse.data)
            ? ratingsResponse.data
            : [];
          console.log(
            "CourseDetails: Processed ratings:",
            JSON.stringify(fetchedRatings, null, 2)
          );
          fetchedRatings.forEach((rating) =>
            console.log(
              "CourseDetails: Rating userId:",
              rating.userId,
              "courseId:",
              rating.courseId,
              "email:",
              rating.user?.email
            )
          );
          setRatings(fetchedRatings);
        } catch (ratingsErr) {
          console.error(
            "CourseDetails: Failed to fetch ratings:",
            ratingsErr.response?.status,
            ratingsErr.response?.data || ratingsErr.message
          );
          setError("Could not load course ratings.");
          setRatings([]);
        }
      } catch (err) {
        console.error(
          "CourseDetails: General error:",
          err.response?.status,
          err.response?.data || err.message
        );
        setError("Failed to load data.");
        if (err.response?.status === 401) {
          console.log("CourseDetails: 401 detected, redirecting to /login");
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
      console.log("CourseDetails: Removing enrollmentId:", enrollmentId);
      await api.delete(`/progress/enrollments/${enrollmentId}`);
      console.log("CourseDetails: Enrollment deleted:", enrollmentId);
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

  const handleAddComment = async (ratingId, enrollmentId) => {
    const content = comments[enrollmentId]?.trim();
    if (!content || content.length < 5) {
      setCommentErrors((prev) => ({
        ...prev,
        [enrollmentId]: "Comment must be at least 5 characters.",
      }));
      return;
    }

    try {
      console.log(
        "CourseDetails: Adding comment to ratingId:",
        ratingId,
        "userId:",
        user.id,
        "content:",
        content
      );
      const response = await api.post(
        `/ratings/courses/${courseId}/ratings/${ratingId}/comments`,
        { content, userId: user.id }
      );
      console.log("CourseDetails: Comment added:", response.data);
      setRatings((prevRatings) =>
        prevRatings.map((rating) =>
          rating.id === ratingId
            ? {
                ...rating,
                comments: [...(rating.comments || []), response.data],
              }
            : rating
        )
      );
      setComments((prev) => ({ ...prev, [enrollmentId]: "" }));
      setCommentErrors((prev) => ({ ...prev, [enrollmentId]: "" }));
      alert("Comment added successfully!");
    } catch (err) {
      console.error(
        "CourseDetails: Failed to add comment:",
        err.response?.status,
        err.response?.data || err.message
      );
      setCommentErrors((prev) => ({
        ...prev,
        [enrollmentId]: err.response?.data?.error || "Failed to add comment.",
      }));
    }
  };

  const StarRating = ({ rating }) => {
    const stars = Array(5)
      .fill(0)
      .map((_, i) => (
        <span
          key={i}
          className={
            i < Math.round(rating * 2) / 2 ? "text-yellow-400" : "text-gray-300"
          }
        >
          ★
        </span>
      ));
    return <div className="flex">{stars}</div>;
  };

  if (loading) {
    return <div className="text-center text-gray-700 text-lg">Loading...</div>;
  }
  if (!user || user.role !== "Instructor") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Course Details</h2>
            <Link
              to="/instructor-dashboard"
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

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Enrolled Students
                </h3>
                {enrollments.length === 0 ? (
                  <div className="text-gray-600 text-center">
                    No students enrolled.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enrollments.map((enrollment) => {
                      const studentReview = ratings.find((rating) => {
                        if (!rating.userId || !rating.courseId) {
                          console.warn(
                            "CourseDetails: Rating missing userId or courseId for rating.id:",
                            rating.id,
                            "userId:",
                            rating.userId,
                            "courseId:",
                            rating.courseId,
                            "email:",
                            rating.user?.email
                          );
                          return false;
                        }
                        return (
                          rating.userId === enrollment.userId &&
                          rating.courseId === enrollment.courseId
                        );
                      });
                      console.log(
                        "CourseDetails: Checking review for enrollment:",
                        enrollment.id,
                        "userId:",
                        enrollment.userId,
                        "courseId:",
                        enrollment.courseId,
                        "email:",
                        enrollment.user?.email,
                        "review:",
                        studentReview
                      );

                      return (
                        <div
                          key={enrollment.id}
                          className="bg-gray-50 p-6 rounded-lg shadow-lg"
                        >
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">
                            {enrollment.user?.email || "Unknown"}
                          </h4>
                          <div className="mb-4">
                            <p className="text-gray-600 font-medium">
                              Progress
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    enrollment.progress?.completionPercentage ||
                                    0
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {enrollment.progress?.completedSessions || 0} of{" "}
                              {enrollment.progress?.totalSessions || 0} sessions
                              completed (
                              {(
                                enrollment.progress?.completionPercentage || 0
                              ).toFixed(2)}
                              %)
                            </p>
                          </div>
                          <div className="mb-4">
                            <p className="text-gray-600 font-medium">Review</p>
                            {studentReview ? (
                              <div>
                                <div className="flex items-center mb-2">
                                  <StarRating rating={studentReview.stars} />
                                  <span className="ml-2 text-gray-600 text-sm">
                                    {studentReview.stars.toFixed(1)}
                                  </span>
                                </div>
                                <p className="text-gray-600">
                                  {studentReview.review || "No text provided."}
                                </p>
                                <div className="mt-2">
                                  <p className="text-gray-600 font-medium">
                                    Comments
                                  </p>
                                  {studentReview.comments &&
                                  studentReview.comments.length > 0 ? (
                                    studentReview.comments.map((comment) => (
                                      <p
                                        key={comment.id}
                                        className="text-gray-500 text-sm mt-1"
                                      >
                                        - {comment.content} (by{" "}
                                        {comment.user?.email || "Unknown"})
                                      </p>
                                    ))
                                  ) : (
                                    <p className="text-gray-500 text-sm">
                                      No comments yet.
                                    </p>
                                  )}
                                </div>
                                <div className="mt-4">
                                  <textarea
                                    value={comments[enrollment.id] || ""}
                                    onChange={(e) =>
                                      setComments((prev) => ({
                                        ...prev,
                                        [enrollment.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Add a comment..."
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                  />
                                  {commentErrors[enrollment.id] && (
                                    <p className="text-red-500 text-sm mt-1">
                                      {commentErrors[enrollment.id]}
                                    </p>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleAddComment(
                                        studentReview.id,
                                        enrollment.id
                                      )
                                    }
                                    className="mt-2 bg-blue-600 text-white py-1 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
                                  >
                                    Submit Comment
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">
                                No review submitted.
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveStudent(enrollment.id)}
                            className="bg-red-600 text-white py-1 px-4 rounded-lg font-semibold hover:bg-red-700 transition"
                          >
                            Remove Student
                          </button>
                        </div>
                      );
                    })}
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
