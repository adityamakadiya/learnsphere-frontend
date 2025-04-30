import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AuthContext from "../context/AuthContext";
import api from "../api"; // Use api.js with cookie-based auth
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  DocumentTextIcon,
  ListBulletIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import "../index.css";

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
    if (loading) {
      console.log("CreateSession: Waiting for auth to load"); // Debug
      return;
    }
    if (!user || user.role !== "Instructor") {
      console.log("CreateSession: Redirecting to /login, user:", user); // Debug
      navigate("/login"); // Redirect to login
    }
    if (!courseId || isNaN(courseId)) {
      console.log("CreateSession: Invalid courseId:", courseId); // Debug
      setError("Invalid course ID.");
      setTimeout(() => navigate("/instructor/dashboard"), 3000); // Match dashboard route
    }
  }, [courseId, user, loading, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    try {
      console.log(
        "CreateSession: Creating session for courseId:",
        courseId,
        "payload:",
        data
      ); // Debug
      const payload = {
        title: data.title,
        youtubeUrl: data.youtubeUrl,
        content: content || "<p>No content provided.</p>",
      };
      const response = await api.post(
        `/sessions/courses/${courseId}/sessions`,
        payload
      );
      console.log("CreateSession: Session created:", response.data); // Debug
      navigate(`/instructor/courses/${courseId}`);
    } catch (err) {
      console.error(
        "CreateSession: Failed to create session:",
        err.response?.status,
        err.response?.data || err.message
      );
      const errorMessage =
        err.response?.status === 401
          ? "Unauthorized. Please log in again."
          : err.response?.status === 403
          ? "You do not own this course."
          : err.response?.data?.error || "Failed to create session.";
      setError(errorMessage);
      if (err.response?.status === 401) {
        console.log("CreateSession: 401 detected, redirecting to /login"); // Debug
        navigate("/login");
      }
    } finally {
      setIsSubmitting(false);
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
      <div className="bg-white p-12 rounded-2xl shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Create Session
        </h2>
        {error && (
          <p className="text-red-500 text-center mb-6 font-medium">{error}</p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              YouTube URL
            </label>
            <input
              type="url"
              {...register("youtubeUrl", {
                required: "YouTube URL is required",
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
                  message: "Invalid YouTube URL",
                },
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.youtubeUrl && (
              <p className="text-red-500 text-sm mt-1">
                {errors.youtubeUrl.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-2 flex flex-wrap gap-2">
                {editor && (
                  <>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={`p-2 rounded-md transition ${
                        editor.isActive("bold")
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-200"
                      }`}
                      title="Bold"
                    >
                      <DocumentTextIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      className={`p-2 rounded-md transition ${
                        editor.isActive("italic")
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-200"
                      }`}
                      title="Italic"
                    >
                      <DocumentTextIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                      }
                      className={`p-2 rounded-md transition ${
                        editor.isActive("heading", { level: 1 })
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-200"
                      }`}
                      title="Heading 1"
                    >
                      <DocumentTextIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                      }
                      className={`p-2 rounded-md transition ${
                        editor.isActive("heading", { level: 2 })
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-200"
                      }`}
                      title="Heading 2"
                    >
                      <DocumentTextIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                      className={`p-2 rounded-md transition ${
                        editor.isActive("bulletList")
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-200"
                      }`}
                      title="Bullet List"
                    >
                      <ListBulletIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                      }
                      className={`p-2 rounded-md transition ${
                        editor.isActive("orderedList")
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-200"
                      }`}
                      title="Numbered List"
                    >
                      <ListBulletIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const previousUrl = editor.getAttributes("link").href;
                        const url = prompt("Enter URL", previousUrl || "");
                        if (url === null) return;
                        if (url === "") {
                          editor.chain().focus().unsetLink().run();
                        } else {
                          editor.chain().focus().setLink({ href: url }).run();
                        }
                      }}
                      className={`p-2 rounded-md transition ${
                        editor.isActive("link")
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-200"
                      }`}
                      title="Link"
                    >
                      <LinkIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
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
