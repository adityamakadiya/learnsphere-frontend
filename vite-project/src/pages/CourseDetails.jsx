import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../api";
import CourseHeader from "../components/CourseHeader";
import CourseInfo from "../components/CourseInfo";
import InstructorCourseActions from "../components/InstructorCourseActions";
import StudentEnrollmentCard from "../components/StudentEnrollmentCard";
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

    const fetchCourseData = async () => {
      setIsFetching(true);
      setError("");
      try {
        // Fetch course details
        const courseResponse = await api.get(`/courses/${courseId}`);
        console.log("CourseDetails: Course response:", courseResponse.data);
        setCourse(courseResponse.data.data);

        // Fetch enrollments with progress
        const enrollmentsResponse = await api.get(
          `/progress/courses/${courseId}/enrollments`
        );
        console.log(
          "CourseDetails: Enrollments response:",
          enrollmentsResponse.data
        );
        setEnrollments(enrollmentsResponse.data || []);

        // Fetch ratings for the course
        const ratingsResponse = await api.get(
          `/ratings/courses/${courseId}/ratings`
        );
        console.log("CourseDetails: Ratings response:", ratingsResponse.data);
        const fetchedRatings = Array.isArray(ratingsResponse.data.ratings)
          ? ratingsResponse.data.ratings
          : Array.isArray(ratingsResponse.data)
          ? ratingsResponse.data
          : [];
        setRatings(fetchedRatings);
      } catch (err) {
        console.error(
          "CourseDetails: Error:",
          err.response?.data || err.message
        );
        setError(err.response?.data?.error || "Failed to load data.");
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
      setEnrollments(
        enrollments.filter((enrollment) => enrollment.id !== enrollmentId)
      );
      alert("Student removed successfully!");
    } catch (err) {
      console.error(
        "CourseDetails: Failed to remove student:",
        err.response?.data
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
      console.log("CourseDetails: Adding comment to ratingId:", ratingId);
      const response = await api.post(
        `/ratings/courses/${courseId}/ratings/${ratingId}/comments`,
        {
          content,
          userId: user.id,
        }
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
        err.response?.data
      );
      setCommentErrors((prev) => ({
        ...prev,
        [enrollmentId]: err.response?.data?.error || "Failed to add comment.",
      }));
    }
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
          <InstructorCourseActions courseId={courseId} />
          <CourseHeader
            course={course}
            error={error}
            fetchCourseData={() => {}}
          />
          {isFetching ? (
            <div className="text-center text-gray-600 text-lg">Loading...</div>
          ) : !course ? (
            <div className="text-center text-gray-600 text-lg">
              Course not found.
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-8">
                <CourseInfo course={course} />
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
                    {enrollments.map((enrollment) => (
                      <StudentEnrollmentCard
                        key={enrollment.id}
                        enrollment={enrollment}
                        ratings={ratings}
                        comments={comments}
                        setComments={setComments}
                        commentErrors={commentErrors}
                        setCommentErrors={setCommentErrors}
                        handleRemoveStudent={handleRemoveStudent}
                        handleAddComment={handleAddComment}
                      />
                    ))}
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
