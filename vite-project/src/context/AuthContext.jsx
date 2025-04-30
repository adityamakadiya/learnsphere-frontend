import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from '../api'; // Import custom Axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await api.get("/auth/me"); // Uses cookies
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || "Login failed");
    }
  };

  const register = async (email, password, role) => {
    try {
      const res = await api.post("/auth/register", { email, password, role });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || "Registration failed");
    }
  };

  const logout = async() => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
      setUser(null);
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout }}
    >
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-gray-700">Loading...</div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;
