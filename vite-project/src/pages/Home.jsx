import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../api";
import "../index.css";

function Home() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError("");
      try {
        console.log("Home: Fetching courses for user:", user?.id);
        const response = await api.get("/courses/allCourses");
        console.log("Home: Courses response:", response.data);

        // Fetch ratings for each course
        const coursesWithRatings = await Promise.all(
          (response.data.data || []).map(async (course) => {
            try {
              const ratingsResponse = await api.get(
                `/ratings/courses/${course.id}/ratings`
              );
              console.log(
                `Home: Ratings for course ${course.id}:`,
                ratingsResponse.data
              );
              return {
                ...course,
                averageRating: ratingsResponse.data.averageRating || 0,
                ratingCount: ratingsResponse.data.ratingCount || 0,
              };
            } catch (err) {
              console.error(
                `Home: Failed to fetch ratings for course ${course.id}:`,
                err
              );
              return { ...course, averageRating: 0, ratingCount: 0 }; // Fallback
            }
          })
        );

        setCourses(coursesWithRatings);
      } catch (err) {
        console.error(
          "Home: Failed to fetch courses:",
          err.response?.status,
          err.response?.data || err.message
        );
        setError("Failed to fetch courses.");
        if (err.response?.status === 401) {
          console.log("Home: 401 detected, redirecting to /login");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCourses();
    } else {
      console.log("Home: No user, skipping course fetch");
    }
  }, [user, navigate]);

  // Star rating component
  const StarRating = ({ rating }) => {
    const stars = Array(5)
      .fill(0)
      .map((_, i) => (
        <span
          key={i}
          className={
            i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"
          }
        >
          ★
        </span>
      ));
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-6xl">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">
          Welcome to LearnSphere
        </h1>
        {user ? (
          <>
            <p className="text-lg text-gray-700 text-center mb-8">
              Hello, <span className="font-semibold">{user.email}</span>!{" "}
              {user.role === "Instructor"
                ? "Here are all available courses."
                : `You are logged in as ${user.role}.`}
            </p>
            {user.role === "Instructor" ? (
              <>
                {error && (
                  <p className="text-red-500 text-center mb-6 font-medium">
                    {error}
                  </p>
                )}
                {loading ? (
                  <p className="text-gray-600 text-center">Loading...</p>
                ) : courses.length === 0 ? (
                  <p className="text-gray-600 text-center">
                    No courses available.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-gray-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                      >
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                          {course.title}
                        </h2>
                        <p className="text-gray-600 mb-4">
                          {course.description}
                        </p>
                        <p className="text-gray-500 text-sm mb-2">
                          Category: {course.category?.name || "Unknown"}
                        </p>
                        <div className="flex items-center mb-2">
                          <StarRating rating={course.averageRating} />
                          <span className="ml-2 text-gray-600 text-sm">
                            {course.averageRating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                          {course.ratingCount}{" "}
                          {course.ratingCount === 1 ? "review" : "reviews"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-lg text-gray-700 text-center">
                Browse courses or enroll to start learning!
              </p>
            )}
          </>
        ) : (
          <p className="text-lg text-gray-700 text-center">
            Please log in or register to continue.
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;
