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
    content: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Authentication check
  useEffect(() => {
    if (loading) {
      console.log("UpdateSession: Waiting for auth to load"); // Debug
      return;
    }
    if (!user || user.role !== "Instructor") {
      console.log("UpdateSession: Redirecting to /login, user:", user); // Debug
      navigate("/login");
      return;
    }
  }, [user, loading, navigate]);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        console.log(`UpdateSession: Fetching sessionId=${sessionId}`); // Debug
        const response = await api.get(`/sessions/sid/${sessionId}`);
        console.log("UpdateSession: Session Response:", response.data); // Debug
        const session = response.data.data;
        if (!session) {
          throw new Error("Session data not found in response");
        }

        setFormData({
          title: session.title,
          youtubeUrl: session.youtubeUrl || "",
          content: session.content || "<p></p>",
        });
      } catch (err) {
        console.error(
          "UpdateSession: Fetch Session Error:",
          err.response?.status,
          err.response?.data || err.message
        );
        const errorMessage =
          err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : err.response?.status === 403
            ? "You are not authorized to edit this session."
            : err.response?.status === 404
            ? "Session not found."
            : err.response?.data?.error || "Failed to fetch session data.";
        setError(errorMessage);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };
    fetchSession();
  }, [sessionId, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle rich text editor changes
  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      console.log(
        "UpdateSession: Updating sessionId:",
        sessionId,
        "payload:",
        formData
      ); // Debug
      const response = await api.put(`/sessions/${sessionId}`, {
        title: formData.title,
        youtubeUrl: formData.youtubeUrl,
        content: formData.content || "<p>No content provided.</p>",
      });
      console.log("UpdateSession: Update Response:", response.data); // Debug
      alert("Session updated successfully!");
      navigate(`/instructor/courses/${courseId}/sessions`);
    } catch (err) {
      console.error(
        "UpdateSession: Update Session Error:",
        err.response?.status,
        err.response?.data || err.message
      );
      const errorMessage =
        err.response?.status === 401
          ? "Unauthorized. Please log in again."
          : err.response?.status === 403
          ? "You are not authorized to update this session."
          : err.response?.status === 500
          ? "Server error. Please try again later."
          : err.response?.data?.error || "Failed to update session.";
      setError(errorMessage);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-700 text-lg">Loading...</div>;
  }
  if (!user || user.role !== "Instructor") {
    return null; // Handled by useEffect redirect
  }

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
        content={formData.content}
        onChange={handleContentChange}
        initialContent={formData.content}
        error={formData.content ? "" : "Content is required"}
      />
    </FormContainer>
  );
}

export default UpdateSession;
