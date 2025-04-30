import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  // TipTap Editor
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
      setFormData((prev) => ({
        ...prev,
        content: html === "<p></p>" ? "" : html,
      }));
    },
  });

  // Fetch session data
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
        if (editor) {
          editor.commands.setContent(session.content || "<p></p>");
        }
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
  }, [sessionId, user, navigate, loading, editor]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-12 rounded-2xl shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Update Session
        </h2>
        {error && (
          <p className="text-red-500 text-center mb-6 font-medium">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Session Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="youtubeUrl"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              YouTube URL (Optional)
            </label>
            <input
              type="url"
              id="youtubeUrl"
              name="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
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
            {formData.content === "" && (
              <p className="text-red-500 text-sm mt-1">Content is required</p>
            )}
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || !formData.title || !formData.content}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                submitting || !formData.title || !formData.content
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {submitting ? "Updating..." : "Update Session"}
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(`/instructor/courses/${courseId}/sessions`)
              }
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateSession;
