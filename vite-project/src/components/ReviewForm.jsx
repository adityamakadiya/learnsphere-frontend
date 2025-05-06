import FormContainer from "./FormContainer";

const ReviewForm = ({
  review,
  stars,
  setStars,
  reviewText,
  setReviewText,
  reviewError,
  submittingReview,
  handleReviewSubmit,
  courseId,
}) => {
  const handleStarClick = (star) => {
    setStars(star);
  };

  const isValid = stars >= 1 && stars <= 5 && reviewText.trim().length >= 50;

  return (
    <section className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Review</h3>
      {review ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-2xl ${
                    i < review.stars ? "text-yellow-400" : "text-gray-300"
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
        <FormContainer
          title=""
          error={reviewError}
          onSubmit={(e) => {
            e.preventDefault();
            handleReviewSubmit();
          }}
          cancelRoute={`/student/courses/${courseId}`}
          submitText="Submit Review"
          isSubmitting={submittingReview}
          isValid={isValid}
          maxWidth="max-w-full"
        >
          <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleStarClick(i + 1)}
                className={`text-2xl focus:outline-none ${
                  i < stars ? "text-yellow-400" : "text-gray-300"
                } hover:text-yellow-300 transition-colors`}
                aria-label={`Rate ${i + 1} star${i + 1 === 1 ? "" : "s"}`}
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
        </FormContainer>
      )}
    </section>
  );
};

export default ReviewForm;
