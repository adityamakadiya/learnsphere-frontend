import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../api"; // Use api.js with cookie-based auth
import "../index.css";

function Home() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "Instructor") {
      console.log("Home: Skipping course fetch, user:", user); // Debug
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      setError("");
      try {
        console.log("Home: Fetching courses for user:", user.id); // Debug
        const response = await api.get("/courses/allCourses");
        console.log("Home: Courses response:", response.data); // Debug
        setCourses(response.data.data || []);
      } catch (err) {
        console.error(
          "Home: Failed to fetch courses:",
          err.response?.status,
          err.response?.data || err.message
        );
        setError("Failed to fetch courses.");
        if (err.response?.status === 401) {
          console.log("Home: 401 detected, redirecting to /login"); // Debug
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-6xl">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">
          Welcome to LearnSphere
        </h1>
        {user ? (
          user.role === "Instructor" ? (
            <>
              <p className="text-lg text-gray-700 text-center mb-8">
                Hello, <span className="font-semibold">{user.email}</span>! Here
                are all available courses.
              </p>
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
                      <p className="text-gray-600 mb-4">{course.description}</p>
                      <p className="text-gray-500 text-sm">
                        Category: {course.category?.name || "Unknown"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-lg text-gray-700 text-center">
              Hello, <span className="font-semibold">{user.email}</span>! You
              are logged in as{" "}
              <span className="font-semibold">{user.role}</span>.
            </p>
          )
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
