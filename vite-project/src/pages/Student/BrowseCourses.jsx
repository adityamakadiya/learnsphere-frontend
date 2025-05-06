import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import api from "../../api";
import CategoryFilter from "../../components/CategoryFilter";
import CourseCard from "../../components/CourseCard";
import "../../index.css";

function BrowseCourses() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    console.log(
      "BrowseCourses: useEffect, authLoading:",
      authLoading,
      "user:",
      user
    ); // Debug
    if (authLoading) {
      console.log("BrowseCourses: Waiting for auth"); // Debug
      return;
    }
    if (!user || user.role !== "Student") {
      console.log("BrowseCourses: Redirecting to /login, user:", user); // Debug
      navigate("/login", { replace: true });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setErrors([]);
      try {
        // Fetch courses
        const coursesUrl = selectedCategory
          ? `/students/courses?categoryId=${selectedCategory}`
          : "/students/courses";
        let coursesData = [];
        try {
          const coursesResponse = await api.get(coursesUrl);
          coursesData = coursesResponse.data.data;
          console.log("BrowseCourses: Courses:", coursesData); // Debug
          // Fetch ratings for each course
          const coursesWithRatings = await Promise.all(
            coursesData.map(async (course) => {
              try {
                const ratingsResponse = await api.get(
                  `/ratings/courses/${course.id}/ratings`
                );
                console.log(
                  `BrowseCourses: Ratings for course ${course.id}:`,
                  ratingsResponse.data
                );
                return {
                  ...course,
                  averageRating: ratingsResponse.data.averageRating || 0,
                  ratingCount: ratingsResponse.data.ratingCount || 0,
                };
              } catch (err) {
                console.error(
                  `BrowseCourses: Failed to fetch ratings for course ${course.id}:`,
                  err
                );
                return { ...course, averageRating: 0, ratingCount: 0 };
              }
            })
          );
          setCourses(coursesWithRatings);
        } catch (courseErr) {
          console.error(
            "BrowseCourses: Failed to fetch courses:",
            courseErr.response?.status,
            courseErr.response?.data || courseErr.message
          );
          setErrors((prev) => [...prev, "Could not load courses."]);
        }

        // Fetch categories
        let categoriesData = [];
        try {
          const categoriesResponse = await api.get("/courses/category");
          categoriesData = categoriesResponse.data.data;
          console.log("BrowseCourses: Categories:", categoriesData); // Debug
          setCategories(categoriesData);
        } catch (catErr) {
          console.error(
            "BrowseCourses: Failed to fetch categories:",
            catErr.response?.status,
            catErr.response?.data || catErr.message
          );
          setErrors((prev) => [...prev, "Could not load categories."]);
        }

        // Fetch enrolled courses
        let enrolledIds = [];
        try {
          const enrollmentsResponse = await api.get("/students/enrollments");
          enrolledIds = enrollmentsResponse.data.data.map((e) => e.course.id);
          console.log(
            "BrowseCourses: Enrollments:",
            enrollmentsResponse.data.data
          ); // Debug
          setEnrolledCourseIds(enrolledIds);
        } catch (enrollErr) {
          console.error(
            "BrowseCourses: Failed to fetch enrollments:",
            enrollErr.response?.status,
            enrollErr.response?.data || enrollErr.message
          );
          setErrors((prev) => [...prev, "Could not load enrolled courses."]);
        }
      } catch (err) {
        console.error(
          "BrowseCourses: General fetch error:",
          err.response?.status,
          err.response?.data || err.message
        );
        setErrors((prev) => [...prev, "Failed to load data."]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, selectedCategory, navigate]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId ? parseInt(categoryId) : null);
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/students/courses/${courseId}/enroll`, {});
      console.log("BrowseCourses: Enroll response: Success"); // Debug
      setEnrolledCourseIds([...enrolledCourseIds, courseId]);
      alert("Enrolled successfully!");
    } catch (err) {
      console.error(
        "BrowseCourses: Failed to enroll:",
        err.response?.status,
        err.response?.data || err.message
      );
      alert(err.response?.data?.error || "Failed to enroll.");
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description &&
        course.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  console.log(
    "BrowseCourses: Render, authLoading:",
    authLoading,
    "user:",
    user
  );

  if (authLoading) {
    return <div className="text-center text-gray-700 text-lg">Loading...</div>;
  }
  if (!user || user.role !== "Student") {
    console.log("BrowseCourses: Render redirect, user:", user); // Debug
    return null; // Handled by useEffect redirect
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">
          Browse Courses
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={handleSearch}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
          />
        </div>
        {errors.length > 0 && (
          <p className="text-red-500 text-center mb-6 font-medium">
            {[...new Set(errors)].join(" ")}
          </p>
        )}
        {loading ? (
          <p className="text-gray-600 text-center">Loading courses...</p>
        ) : filteredCourses.length === 0 ? (
          <p className="text-gray-600 text-center">No courses found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={enrolledCourseIds.includes(course.id)}
                onEnroll={handleEnroll}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseCourses;
