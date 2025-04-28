import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import CategoryFilter from "../../components/CategoryFilter";
import "../../index.css";

function BrowseCourses() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "Student") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setErrors([]); // Reset errors on new fetch
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch courses
        const coursesUrl = selectedCategory
          ? `http://localhost:5000/students/courses?categoryId=${selectedCategory}`
          : "http://localhost:5000/students/courses";
        let coursesData = [];
        try {
          const coursesResponse = await axios.get(coursesUrl, { headers });
          coursesData = coursesResponse.data.data;
          console.log("Courses:", coursesData);
          setCourses(coursesData);
        } catch (courseErr) {
          console.error(
            "Failed to fetch courses:",
            courseErr.response?.data || courseErr.message
          );
          setErrors((prev) => [...prev, "Could not load courses."]);
        }
        
        // Fetch categories
        let categoriesData = [];
        try {
          const categoriesResponse = await axios.get(
            "http://localhost:5000/courses/category",
            { headers }
          );
          categoriesData = categoriesResponse.data.data;
          console.log("Categories:", categoriesData);
          setCategories(categoriesData);
        } catch (catErr) {
          console.error(
            "Failed to fetch categories:",
            catErr.response?.data || catErr.message
          );
          setErrors((prev) => [...prev, "Could not load categories."]);
        }

        // Fetch enrolled courses
        let enrolledIds = [];
        try {
          const enrollmentsResponse = await axios.get(
            "http://localhost:5000/students/enrollments",
            { headers }
          );
          enrolledIds = enrollmentsResponse.data.data.map((e) => e.course.id);
          console.log("Enrollments:", enrollmentsResponse.data.data);
          setEnrolledCourseIds(enrolledIds);
        } catch (enrollErr) {
          console.error(
            "Failed to fetch enrollments:",
            enrollErr.response?.data || enrollErr.message
          );
          setErrors((prev) => [...prev, "Could not load enrolled courses."]);
        }
      } catch (err) {
        console.error(
          "General fetch error:",
          err.response?.data || err.message
        );
        setErrors((prev) => [...prev, "Failed to load data."]);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]); // Removed selectedCategory to prevent re-fetch

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId ? parseInt(categoryId) : null);
    // Fetch courses for new category
    const fetchCourses = async () => {
      setLoading(true);
      setErrors([]);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const coursesUrl = categoryId
          ? `http://localhost:5000/students/courses?categoryId=${categoryId}`
          : "http://localhost:5000/students/courses";
        const coursesResponse = await axios.get(coursesUrl, { headers });
        const coursesData = coursesResponse.data.data;
        console.log("Courses for category:", coursesData);
        setCourses(coursesData);
      } catch (courseErr) {
        console.error(
          "Failed to fetch courses:",
          courseErr.response?.data || courseErr.message
        );
        setErrors(["Could not load courses."]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  };

  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/students/courses/${courseId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnrolledCourseIds([...enrolledCourseIds, courseId]);
      alert("Enrolled successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to enroll.");
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description &&
        course.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              <div
                key={course.id}
                className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition aspect-square flex flex-col"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                  {course.title}
                </h2>
                <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                  {course.description || "No description available."}
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Category: {course.category?.name || "Unknown"}
                </p>
                <button
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrolledCourseIds.includes(course.id)}
                  className={`w-full py-2 rounded-lg text-white font-medium transition ${
                    enrolledCourseIds.includes(course.id)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {enrolledCourseIds.includes(course.id)
                    ? "Enrolled"
                    : "Enroll"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseCourses;
