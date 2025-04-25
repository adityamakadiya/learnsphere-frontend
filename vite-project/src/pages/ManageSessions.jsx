import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";

function ManageSessions() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const { courseId } = useParams();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "Instructor") {
      navigate("/");
      return;
    }

    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/sessions/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSessions(response.data.data);
      } catch (err) {
        setError(`Failed to fetch sessions: ${err.message}`);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };
    fetchSessions();
  }, [courseId, user, navigate, loading]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-10 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Manage Sessions
            </h2>
            <Link
              to={`/courses/${courseId}`}
              className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700"
            >
              Back to Course
            </Link>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {sessions.length === 0 ? (
            <p className="text-gray-600">No sessions available.</p>
          ) : (
            <ul className="space-y-4">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  className="bg-gray-50 p-6 rounded-lg shadow-md"
                >
                  <h4 className="text-lg font-semibold text-gray-800">
                    {session.title}
                  </h4>
                  <p className="text-gray-600 mt-2">
                    {session.content || "No content provided."}
                  </p>
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
