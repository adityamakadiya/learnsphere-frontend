import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../api";
import FormContainer from "../components/FormContainer";
import InputField from "../components/InputField";
import RichTextEditor from "../components/RichTextEditor";
import "../index.css";

function UpdateSession() {
  const { sessionId, courseId } = useParams();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    youtubeUrl: "",
    content: "<p></p>",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Authentication check
  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "Instructor") {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await api.get(`/sessions/sid/${sessionId}`);
        const session = response.data.data;
        if (!session) {
          throw new Error("Session data not found");
        }
        // console.log("Fetched session content:", session.content); // Debug
        setFormData({
          title: session.title || "",
          youtubeUrl: session.youtubeUrl || "",
          content: session.content || "<p></p>",
        });
      } catch (err) {
        console.error("Fetch error:", err.response?.data || err.message);
        const errorMessage =
          err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : err.response?.status === 403
            ? "You are not authorized to edit this session."
            : err.response?.status === 404
            ? "Session not found."
            : "Failed to fetch session data.";
        setError(errorMessage);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };
    fetchSession();
  }, [sessionId, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle rich text editor changes
  const handleContentChange = (content) => {
    // console.log("Content changed:", content); // Debug
    setFormData((prev) => ({ ...prev, content }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData); // Debug
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        youtubeUrl: formData.youtubeUrl,
        content: formData.content || "<p>No content provided.</p>",
      };
      await api.put(`/sessions/${sessionId}`, payload);
      alert("Session updated successfully!");
      navigate(`/instructor/courses/${courseId}/sessions`);
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      const errorMessage =
        err.response?.status === 401
          ? "Unauthorized. Please log in again."
          : err.response?.status === 403
          ? "You are not authorized to update this session."
          : err.response?.status === 500
          ? "Server error. Please try again later."
          : "Failed to update session.";
      setError(errorMessage);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Render loading state
  if (loading) {
    return <div className="text-center text-gray-700 text-lg">Loading...</div>;
  }

  // Redirect handled by useEffect
  if (!user || user.role !== "Instructor") {
    return null;
  }

  // Form validation
  const isFormValid = formData.title && formData.content;

  return (
    <FormContainer
      title="Update Session"
      error={error}
      onSubmit={handleSubmit}
      cancelRoute={`/instructor/courses/${courseId}/sessions`}
      submitText="Update Session"
      isSubmitting={submitting}
      isValid={isFormValid}
    >
      <InputField
        label="Session Title"
        id="title"
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        required
        error={formData.title ? "" : "Title is required"}
      />
      <InputField
        label="YouTube URL (Optional)"
        id="youtubeUrl"
        name="youtubeUrl"
        type="url"
        value={formData.youtubeUrl}
        onChange={handleInputChange}
      />
      <RichTextEditor
        value={formData.content}
        onChange={handleContentChange}
        error={formData.content ? "" : "Content is required"}
      />
    </FormContainer>
  );
}

export default UpdateSession;
