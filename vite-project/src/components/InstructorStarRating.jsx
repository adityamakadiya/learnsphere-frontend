const InstructorStarRating = ({ rating }) => {
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

export default InstructorStarRating;
