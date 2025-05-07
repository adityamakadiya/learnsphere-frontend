import ReviewDisplay from "./ReviewDisplay";
import ReviewForm from "./ReviewForm";

const CourseReviews = ({
  courseId,
  review,
  courseReviews,
  averageRating,
  ratingCount,
  stars,
  setStars,
  reviewText,
  setReviewText,
  reviewError,
  submittingReview,
  handleReviewSubmit,
  userEmail,
}) => {
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 animate-fade-in">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Reviews</h3>
        <div className="flex items-center mb-3">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <span
                key={i}
                className={
                  i < Math.round(averageRating)
                    ? "text-yellow-400 text-base sm:text-lg"
                    : "text-gray-300 text-base sm:text-lg"
                }
                aria-hidden="true"
              >
                ★
              </span>
            ))}
          <span className="ml-2 text-gray-600 text-sm sm:text-base">
            {averageRating.toFixed(1)} ({ratingCount}{" "}
            {ratingCount === 1 ? "review" : "reviews"})
          </span>
        </div>
        {courseReviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2">
            {courseReviews.map((courseReview) => (
              <ReviewDisplay
                key={courseReview.id}
                review={courseReview}
                userEmail={courseReview.user.email}
              />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 animate-fade-in">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
          {review ? "Your Review" : "Write a Review"}
        </h3>
        {review ? (
          <ReviewDisplay review={review} userEmail={userEmail} />
        ) : (
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
        )}
      </section>
    </div>
  );
};

export default CourseReviews;