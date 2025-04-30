import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "../index.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call context logout
    setIsOpen(false);
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            LearnSphere
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Home
                </Link>
                {user.role === 'Student' && (
                  <>
                    <Link
                      to="/student/dashboard"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/student/courses"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      Browse Courses
                    </Link>
                  </>
                )}
                {user.role === 'Instructor' && (
                  <>
                    <Link
                      to="/instructor-dashboard"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      Manage Courses
                    </Link>
                    <Link
                      to="/instructor/courses/new"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      Add Course
                    </Link>
                    <Link
                      to="/instructor/profile"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      Profile
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
          <button
            className="md:hidden text-gray-700 hover:text-blue-600 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-base font-medium"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-base font-medium"
                  onClick={toggleMenu}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-base font-medium"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
                {user.role === 'Student' && (
                  <>
                    <Link
                      to="/student/dashboard"
                      className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-base font-medium"
                      onClick={toggleMenu}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/student/courses"
                      className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-base font-medium"
                      onClick={toggleMenu}
                    >
                      Browse Courses
                    </Link>
                  </>
                )}
                {user.role === 'Instructor' && (
                  <>
                    <Link
                      to="/instructor-dashboard"
                      className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-base font-medium"
                      onClick={toggleMenu}
                    >
                      Manage Courses
                    </Link>
                    <Link
                      to="/instructor/courses/new"
                      className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-base font-medium"
                      onClick={toggleMenu}
                    >
                      Add Course
                    </Link>
                    <Link
                      to="/instructor/profile"
                      className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-base font-medium"
                      onClick={toggleMenu}
                    >
                      Profile
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 hover:text-red-700 px-3 py-2 rounded-lg text-base font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
