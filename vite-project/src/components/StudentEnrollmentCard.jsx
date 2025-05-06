import ProgressBar from "./ProgressBar";
import InstructorStarRating from "./InstructorStarRating";

const StudentEnrollmentCard = ({
  enrollment,
  ratings,
  comments,
  setComments,
  commentErrors,
  setCommentErrors,
  handleRemoveStudent,
  handleAddComment,
}) => {
  const studentReview = ratings.find(
    (rating) =>
      rating.userId === enrollment.userId &&
      rating.courseId === enrollment.courseId
  );

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
      <h4 className="text-lg font-semibold text-gray-800 mb-2">
        {enrollment.user?.email || "Unknown"}
      </h4>
      <div className="mb-4">
        <p className="text-gray-600 font-medium">Progress</p>
        <ProgressBar
          loading={false}
          progress={{
            completionPercentage:
              enrollment.progress?.completionPercentage || 0,
            completedSessions: enrollment.progress?.completedSessions || 0,
            totalSessions: enrollment.progress?.totalSessions || 0,
          }}
        />
      </div>
      <div className="mb-4">
        <p className="text-gray-600 font-medium">Review</p>
        {studentReview ? (
          <div>
            <div className="flex items-center mb-2">
              <InstructorStarRating rating={studentReview.stars} />
              <span className="ml-2 text-gray-600 text-sm">
                {studentReview.stars.toFixed(1)}
              </span>
            </div>
            <p className="text-gray-600">
              {studentReview.review || "No text provided."}
            </p>
            <div className="mt-2">
              <p className="text-gray-600 font-medium">Comments</p>
              {studentReview.comments && studentReview.comments.length > 0 ? (
                studentReview.comments.map((comment) => (
                  <p key={comment.id} className="text-gray-500 text-sm mt-1">
                    - {comment.content} (by {comment.user?.email || "Unknown"})
                  </p>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No comments yet.</p>
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
                  handleAddComment(studentReview.id, enrollment.id)
                }
                className="mt-2 bg-blue-600 text-white py-1 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Submit Comment
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No review submitted.</p>
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
};

export default StudentEnrollmentCard;
