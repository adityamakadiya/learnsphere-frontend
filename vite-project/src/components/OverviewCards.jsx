import { ChartBarIcon, UsersIcon, StarIcon } from "@heroicons/react/24/solid";

const OverviewCards = ({ enrollments, ratings, completions }) => {
  const totalEnrollments = enrollments.reduce(
    (sum, e) => sum + e.enrollmentCount,
    0
  );
  const averageRating = ratings.length
    ? (
        ratings.reduce((sum, r) => sum + r.averageRating, 0) / ratings.length
      ).toFixed(1)
    : 0;
  const totalCompleted = completions.reduce(
    (sum, c) => sum + c.completedSessions,
    0
  );
  const totalPossible = completions.reduce(
    (sum, c) => sum + c.totalPossible,
    0
  );
  const overallCompletion = totalPossible
    ? ((totalCompleted / totalPossible) * 100).toFixed(2)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
      <div className="bg-gradient-to-r from-blue-50 to-white p-4 sm:p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg hover:scale-105 transition-transform animate-slide-up">
        <UsersIcon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 mb-3" />
        <h2 className="text-lg sm:text-xl font-semibold text-blue-800">
          Total Enrollments
        </h2>
        <p className="text-2xl sm:text-3xl font-extrabold text-blue-900">
          {totalEnrollments}
        </p>
      </div>
      <div className="bg-gradient-to-r from-blue-50 to-white p-4 sm:p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg hover:scale-105 transition-transform animate-slide-up">
        <StarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 mb-3" />
        <h2 className="text-lg sm:text-xl font-semibold text-blue-800">
          Average Rating
        </h2>
        <p className="text-2xl sm:text-3xl font-extrabold text-blue-900">
          {averageRating} / 5
        </p>
      </div>
      <div className="bg-gradient-to-r from-blue-50 to-white p-4 sm:p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg hover:scale-105 transition-transform animate-slide-up">
        <ChartBarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 mb-3" />
        <h2 className="text-lg sm:text-xl font-semibold text-blue-800">
          Completion Rate
        </h2>
        <p className="text-2xl sm:text-3xl font-extrabold text-blue-900">
          {overallCompletion}%
        </p>
      </div>
    </div>
  );
};

export default OverviewCards;
