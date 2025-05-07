import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../api";
import CourseCard from "../components/CourseCard";
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
        const response = await api.get("/courses/allCourses");

        // Fetch ratings for each course
        const coursesWithRatings = await Promise.all(
          (response.data.data || []).map(async (course) => {
            try {
              const ratingsResponse = await api.get(
                `/ratings/courses/${course.id}/ratings`
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
                      <CourseCard key={course.id} course={course} />
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
