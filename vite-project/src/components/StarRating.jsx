const StarRating = ({ rating }) => {
  const stars = Array(5)
    .fill(0)
    .map((_, i) => (
      <span
        key={i}
        className={i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"}
      >
        ★
      </span>
    ));
  return <div className="flex">{stars}</div>;
};

export default StarRating;
