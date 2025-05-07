const ReviewDisplay = ({ review, userEmail }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <span
                key={i}
                className={
                  i < review.stars
                    ? "text-yellow-400 text-lg"
                    : "text-gray-300 text-lg"
                }
                aria-hidden="true"
              >
                ★
              </span>
            ))}
          <span className="ml-2 text-gray-600 text-sm">{review.stars.toFixed(1)}</span>
        </div>
        <span className="text-gray-500 text-sm">{formatDate(review.createdAt)}</span>
      </div>
      <p className="text-gray-700 text-sm mb-2">
        {review.review || "No review text provided."}
      </p>
      <p className="text-gray-500 text-xs font-medium">{userEmail}</p>
    </div>
  );
};

export default ReviewDisplay;