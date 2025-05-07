import { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const initializeAuth = async () => {
    if (location.pathname === "/login" || location.pathname === "/register") {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      console.log("AuthContext: /auth/me response:", response.data); // Debug
      setUser(response.data.user || response.data); // Handle both response structures
    } catch (err) {
      console.error(
        "AuthContext: Initialize auth error:",
        err.response?.status,
        err.response?.data || err.message
      );
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, [location.pathname]);

  const register = async (email, password, role) => {
    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        role,
      });
      return response.data;
    } catch (err) {
      console.error(
        "AuthContext: Register error:",
        err.response?.status,
        err.response?.data || err.message
      );
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      console.error(
        "AuthContext: Login error:",
        err.response?.status,
        err.response?.data || err.message
      );
      throw err;
    }
  };

  const googleLogin = async (idToken) => {
    try {
      const response = await api.post(
        "/auth/google",
        { idToken },
        {
          withCredentials: true,
        }
      );
      setUser(response.data.user);
      navigate(
        response.data.user.role === "Instructor" ? "/" : "/student/dashboard"
      );
      return response.data.user;
    } catch (err) {
      console.error(
        "AuthContext: Google login error:",
        err.response?.status,
        err.response?.data || err.message
      );
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error(
        "AuthContext: Logout error:",
        err.response?.status,
        err.response?.data || err.message
      );
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, googleLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;