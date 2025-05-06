import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AuthContext from "../context/AuthContext";
import api from "../api";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

import FormInput from "../components/FormInput";
import TiptapToolbar from "../components/TiptapToolbar";

function CreateSession() {
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { courseId } = useParams();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      youtubeUrl: "",
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html === "<p></p>" ? "" : html);
    },
  });

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== "Instructor") {
      navigate("/login");
    }

    if (!courseId || isNaN(courseId)) {
      setError("Invalid course ID.");
      setTimeout(() => navigate("/instructor/dashboard"), 3000);
    }
  }, [courseId, user, loading, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    try {
      const payload = {
        title: data.title,
        youtubeUrl: data.youtubeUrl,
        content: content || "<p>No content provided.</p>",
      };
      await api.post(`/sessions/courses/${courseId}/sessions`, payload);
      navigate(`/instructor/courses/${courseId}`);
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? "Unauthorized. Please log in again."
          : err.response?.status === 403
          ? "You do not own this course."
          : err.response?.data?.error || "Failed to create session.";
      setError(errorMessage);
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-700 text-lg">Loading...</div>;
  }

  if (!user || user.role !== "Instructor") {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-12 rounded-2xl shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Create Session
        </h2>
        {error && (
          <p className="text-red-500 text-center mb-6 font-medium">{error}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            label="Title"
            name="title"
            register={register}
            validation={{ required: "Title is required" }}
            error={errors.title}
          />

          <FormInput
            label="YouTube URL"
            name="youtubeUrl"
            type="url"
            register={register}
            validation={{
              required: "YouTube URL is required",
              pattern: {
                value: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
                message: "Invalid YouTube URL",
              },
            }}
            error={errors.youtubeUrl}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <TiptapToolbar editor={editor} />
              <EditorContent
                editor={editor}
                className="prose prose-blue max-w-none p-4 min-h-[200px] focus:outline-none"
              />
            </div>
            {content === "" && (
              <p className="text-red-500 text-sm mt-1">Content is required</p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || !content}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                isSubmitting || !content
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/instructor/courses/${courseId}`)}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateSession;
