import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import "../index.css";

function EditCourse() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "Instructor") {
      navigate("/");
      return;
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
        setTitle(course.title);
        setDescription(course.description || "");
        setCategoryId(course.categoryId.toString());
      } catch (err) {
        setError("Failed to fetch course");
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/courses/category"
        );
        setCategories(response.data.data);
      } catch (err) {
        setError("Failed to fetch categories");
      }
    };

    fetchCourse();
    fetchCategories();
  }, [courseId, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !categoryId) {
      setError("All fields are required");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/courses/${courseId}`,
        { title, description, categoryId: parseInt(categoryId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/instructor-dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update course");
    }
  };

  if (!user || user.role !== "Instructor") return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Edit Course
        </h2>
        {error && (
          <p className="text-red-500 text-center mb-4 font-medium">{error}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
              required
            ></textarea>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Save
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
      </div>
    </div>
  );
}

export default EditCourse;
