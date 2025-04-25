import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import "../index.css";

function EditCourse() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const params = useParams();
  const courseId = params.id;
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { title: "", description: "", categoryId: "" },
  });

  useEffect(() => {
    if (loading || !user || user.role !== "Instructor") return navigate("/");
    if (!courseId || isNaN(courseId)) {
      setError("Invalid course ID.");
      setIsFetching(false);
      const timeout = setTimeout(() => navigate("/instructor-dashboard"), 3000);
      return () => clearTimeout(timeout);
    }

    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/courses/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const course = response.data.data;
        setValue("title", course.title);
        setValue("description", course.description || "");
        setValue("categoryId", course.categoryId.toString());
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "Course not found"
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : `Failed to fetch course: ${err.message}`
        );
        if (err.response?.status === 401) navigate("/login");
      }
    };

    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/courses/category",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCategories(response.data.data);
      } catch (err) {
        setError(`Failed to fetch categories: ${err.message}.`);
      } finally {
        setIsFetching(false);
      }
    };

    fetchCourse();
    fetchCategories();
  }, [courseId, user, navigate, loading, setValue]);

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/courses/${courseId}`,
        {
          title: data.title,
          description: data.description,
          categoryId: parseInt(data.categoryId),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/instructor-dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error || `Failed to update course: ${err.message}`
      );
    }
  };

  if (loading || !user || user.role !== "Instructor") return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Edit Course
        </h2>
        {error ? (
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => navigate("/instructor-dashboard")}
              className="bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        ) : isFetching ? (
          <div className="text-center text-gray-700 text-lg">
            Loading course...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              {categories.length > 0 ? (
                <select
                  {...register("categoryId", {
                    required: "Category is required",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  disabled
                  placeholder="Categories unavailable"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed"
                />
              )}
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={categories.length === 0}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  categories.length === 0
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => navigate("/instructor-dashboard")}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditCourse;
