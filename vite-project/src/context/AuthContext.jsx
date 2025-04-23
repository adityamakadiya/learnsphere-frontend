import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async(email , password) => {
    const res = await axios.post("http://localhost:5000/auth/login",{
      email, password
    });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (email, password, role) => {
    const res = await axios.post('http://localhost:5000/auth/register',{
      email, password, role
    });
    return res.data;
  }
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
