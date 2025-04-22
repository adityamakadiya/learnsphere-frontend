import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-primary p-5 shadow-modern">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-white text-2xl font-extrabold tracking-wide"
        >
          LearnSphere
        </Link>
        <div className="space-x-6 text-white font-semibold">
          {user ? (
            <>
              <span>Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="hover:underline transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline transition">
                Login
              </Link>
              <Link to="/register" className="hover:underline transition">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
