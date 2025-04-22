import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/10">
      <div className="bg-white p-10 rounded-modern shadow-modern w-full max-w-md">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-primary">Login</h2>
        {error && <p className="text-accent mb-6 text-center font-semibold">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-secondary mb-3 font-semibold" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border border-secondary rounded-modern focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="mb-8">
            <label className="block text-secondary mb-3 font-semibold" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border border-secondary rounded-modern focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white p-4 rounded-modern hover:bg-primary/90 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-secondary font-medium">
          Don’t have an account?{" "}
          <Link to="/register" className="text-primary hover:underline font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
