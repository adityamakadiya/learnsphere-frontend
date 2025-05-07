import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AuthContext from "../context/AuthContext";
import api from "../api"; // Use api.js with cookie-based auth
import "../index.css";

function CreateCourse() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [newCourseId, setNewCourseId] = useState(null);
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
    },
  });

  useEffect(() => {
    if (loading) {
      // console.log("CreateCourse: Waiting for auth to load"); // Debug
      return;
    }
    if (!user || user.role !== "Instructor") {
      // console.log("CreateCourse: Redirecting to /, user:", user); // Debug
      navigate("/login"); // Redirect to login
      return;
    }

    const fetchCategories = async () => {
      try {
        // console.log("CreateCourse: Fetching categories for user:", user.id); // Debug
        const response = await api.get("/courses/category");
        // console.log("CreateCourse: Categories response:", response.data); // Debug
        setCategories(response.data.data || []);
        if (response.data.data?.length > 0) {
          setValue("categoryId", response.data.data[0].id.toString());
        }
      } catch (err) {
        console.error(
          "CreateCourse: Failed to fetch categories:",
          err.response?.status,
          err.response?.data || err.message
        );
        setError(
          `Failed to fetch categories: ${
            err.response?.data?.error || err.message
          }`
        );
      }
    };
    fetchCategories();
  }, [navigate, user, loading, setValue]);

  const onSubmit = async (data) => {
    try {
      // console.log("CreateCourse: Creating course for user:", user.id, data); // Debug
      const response = await api.post("/courses", {
        title: data.title,
        description: data.description,
        categoryId: parseInt(data.categoryId),
      });
      // console.log("CreateCourse: Course created:", response.data); // Debug
      setNewCourseId(response.data.data.id);
    } catch (err) {
      console.error(
        "CreateCourse: Failed to create course:",
        err.response?.status,
        err.response?.data || err.message
      );
      setError(
        `Failed to create course: ${err.response?.data?.error || err.message}`
      );
    }
  };

  const handleAddSections = () => {
    if (newCourseId) {
      // console.log(
      //   "CreateCourse: Navigating to sessions for courseId:",
      //   newCourseId
      // ); // Debug
      navigate(`/instructor/courses/${newCourseId}/sessions/new`);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-700 text-lg">Loading...</div>;
  }
  if (!user || user.role !== "Instructor") {
    return null; // Handled by useEffect redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Course
        </h2>
        {error && (
          <p className="text-red-500 text-center mb-4 font-medium">{error}</p>
        )}
        {newCourseId ? (
          <div className="text-center">
            <p className="text-gray-700 mb-4">Course created successfully!</p>
            <button
              onClick={handleAddSections}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Add Sections
            </button>
            <button
              onClick={() => navigate("/instructor/dashboard")} // Match dashboard route
              className="bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition mt-4"
            >
              Back to Dashboard
            </button>
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
              ></textarea>
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
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => navigate("/instructor/dashboard")}
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

export default CreateCourse;
