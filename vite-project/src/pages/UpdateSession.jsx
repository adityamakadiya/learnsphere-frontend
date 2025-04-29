import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "../index.css";

function UpdateSession() {
  const { sessionId, courseId } = useParams();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    youtubeUrl: "",
    content: { type: "doc", content: [] },
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // TipTap Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, content: editor.getJSON() }));
    },
  });

  // Convert HTML to TipTap JSON (temporary)
  const htmlToTipTap = (html) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const content = [];
      doc.body.childNodes.forEach((node) => {
        if (node.nodeName === "P") {
          const paragraph = { type: "paragraph", content: [] };
          node.childNodes.forEach((child) => {
            if (child.nodeName === "STRONG") {
              paragraph.content.push({
                type: "text",
                text: child.textContent,
                marks: [{ type: "bold" }],
              });
            } else {
              paragraph.content.push({ type: "text", text: child.textContent });
            }
          });
          if (paragraph.content.length > 0) {
            content.push(paragraph);
          }
        }
      });
      return { type: "doc", content };
    } catch (err) {
      console.error("HTML to TipTap Error:", err);
      return { type: "doc", content: [] };
    }
  };

  // Fetch session data
  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "Instructor") {
      navigate("/login");
      return;
    }

    const fetchSession = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(`Fetching sessionId=${sessionId} with token`);

        const response = await axios.get(
          `http://localhost:5000/sessions/sid/${sessionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Session Response:", response.data);
        const session = response.data.data;
        if (!session) {
          throw new Error("Session data not found in response");
        }

        // Handle HTML content
        let content = session.content;
        if (typeof session.content === "string") {
          content = htmlToTipTap(session.content);
        }

        setFormData({
          title: session.title,
          youtubeUrl: session.youtubeUrl || "",
          content: content
        });
        if (editor) {
          editor.commands.setContent(content);
        }
      } catch (err) {
        console.error(
          "Fetch Session Error:",
          err.response?.data || err.message
        );
        setError(err.response?.data?.error || "Failed to fetch session data.");
        if (err.response?.status === 401) {
          navigate("/login");
        } else if (err.response?.status === 403) {
          setError("You are not authorized to edit this session.");
        } else if (err.response?.status === 404) {
          setError("Session not found.");
        } else if (err.response?.status === 500) {
          setError("Server error. Please try again later.");
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
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/sessions/${sessionId}`,
        {
          title: formData.title,
          youtubeUrl: formData.youtubeUrl,
          content: formData.content,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Update Response:", response.data);
      alert("Session updated successfully!");
      navigate(`/instructor/courses/${courseId}/sessions`);
    } catch (err) {
      console.error("Update Session Error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to update session.");
      if (err.response?.status === 401) {
        navigate("/login");
      } else if (err.response?.status === 403) {
        setError("You are not authorized to update this session.");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // TipTap toolbar controls
  const isMarkActive = (mark) => {
    return editor?.isActive(mark) || false;
  };

  if (loading || !user || user.role !== "Instructor") return null;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-10 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Update Session
          </h2>
          {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="youtubeUrl"
                className="block text-sm font-medium text-gray-700"
              >
                YouTube URL (Optional)
              </label>
              <input
                type="url"
                id="youtubeUrl"
                name="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <div className="border border-gray-300 rounded-md">
                <div className="flex gap-2 p-2 bg-gray-50 border-b border-gray-300">
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`px-2 py-1 rounded ${
                      isMarkActive("bold")
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                    title="Bold"
                  >
                    <b>B</b>
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={`px-2 py-1 rounded ${
                      isMarkActive("italic")
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                    title="Italic"
                  >
                    <i>I</i>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor?.chain().focus().toggleUnderline().run()
                    }
                    className={`px-2 py-1 rounded ${
                      isMarkActive("underline")
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                    title="Underline"
                  >
                    <u>U</u>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className={`px-2 py-1 rounded ${
                      editor?.isActive("heading", { level: 2 })
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().setParagraph().run()}
                    className={`px-2 py-1 rounded ${
                      editor?.isActive("paragraph")
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                    title="Paragraph"
                  >
                    P
                  </button>
                </div>
                <EditorContent
                  editor={editor}
                  className="p-4 prose max-w-none"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className={`bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 ${
                  submitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {submitting ? "Updating..." : "Update Session"}
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(`/instructor/courses/${courseId}/sessions`)
                }
                className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateSession;
