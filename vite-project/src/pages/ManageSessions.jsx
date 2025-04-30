import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../api"; // Use api.js with cookie-based auth
import "../index.css";

function ManageSessions() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const { courseId } = useParams();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "No content provided.";
  };

  useEffect(() => {
    if (loading) {
      console.log("ManageSessions: Waiting for auth to load"); // Debug
      return;
    }
    if (!user || user.role !== "Instructor") {
      console.log("ManageSessions: Redirecting to /login, user:", user); // Debug
      navigate("/login"); // Redirect to login
      return;
    }

    const fetchSessions = async () => {
      try {
        console.log(
          "ManageSessions: Fetching sessions for courseId:",
          courseId,
          "user:",
          user.id
        ); // Debug
        const response = await api.get(`/sessions/${courseId}`);
        console.log("ManageSessions: Sessions response:", response.data); // Debug
        setSessions(response.data.data || []);
      } catch (err) {
        console.error(
          "ManageSessions: Failed to fetch sessions:",
          err.response?.status,
          err.response?.data || err.message
        );
        setError(
          `Failed to fetch sessions: ${
            err.response?.data?.error || err.message
          }`
        );
        if (err.response?.status === 401) {
          console.log("ManageSessions: 401 detected, redirecting to /login"); // Debug
          navigate("/login");
        }
      }
    };
    fetchSessions();
  }, [courseId, user, navigate, loading]);

  if (loading) {
    return <div className="text-center text-gray-700 text-lg">Loading...</div>;
  }
  if (!user || user.role !== "Instructor") {
    return null; // Handled by useEffect redirect
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-10 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold text-gray-800">
              Manage Sessions
            </h2>
            <div className="flex gap-4">
              <Link
                to={`/instructor/courses/${courseId}/sessions/new`}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
              >
                Add Session
              </Link>
              <Link
                to={`/instructor/courses/${courseId}`}
                className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700"
              >
                Back to Course
              </Link>
            </div>
          </div>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              {error}
              <button
                onClick={() => fetchSessions()}
                className="ml-4 text-sm text-red-700 underline"
              >
                Retry
              </button>
            </div>
          )}
          {sessions.length === 0 ? (
            <p className="text-gray-600">No sessions available.</p>
          ) : (
            <ul className="space-y-4">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  className="bg-gray-50 p-6 rounded-lg shadow-md flex justify-between items-start"
                >
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {session.title}
                    </h4>
                    <p className="text-gray-600 mt-2">
                      {stripHtml(session.content)}
                    </p>
                  </div>
                  <Link
                    to={`/instructor/courses/${courseId}/sessions/${session.id}/edit`}
                    className="bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700"
                  >
                    Edit Session
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageSessions;
