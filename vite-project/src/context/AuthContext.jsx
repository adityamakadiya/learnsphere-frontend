// import { createContext, useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import api from '../api';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const initializeAuth = async () => {
//       // Skip on /login or /register to prevent loop
//       if (location.pathname === '/login' || location.pathname === '/register') {
//         console.log('initializeAuth: Skipped on /login or /register'); // Debug
//         setLoading(false);
//         return;
//       }

//       console.log('initializeAuth: Starting'); // Debug
//       try {
//         const res = await api.get("/auth/me");
//         console.log('initializeAuth: /auth/me response:', res.data); // Debug
//         setUser(res.data);
//       } catch (err) {
//         console.error('initializeAuth: Error:', err.response?.status, err.response?.data); // Debug
//         setUser(null);
//       } finally {
//         console.log('initializeAuth: Loading complete'); // Debug
//         setLoading(false);
//       }
//     };
//     initializeAuth();
//   }, [location.pathname]);

//   const login = async (email, password) => {
//     try {
//       console.log('login: Attempting login:', { email }); // Debug
//       const res = await api.post("/auth/login", { email, password });
//       console.log('login: Response:', res.data); // Debug
//       setUser(res.data.user);
//       return res.data;
//     } catch (err) {
//       console.error('login: Error:', err.response?.status, err.response?.data); // Debug
//       throw new Error(err.response?.data?.error || "Login failed");
//     }
//   };

//   const register = async (email, password, role) => {
//     try {
//       console.log('register: Attempting registration:', { email, role }); // Debug
//       const res = await api.post("/auth/register", { email, password, role });
//       console.log('register: Response:', res.data); // Debug
//       return res.data;
//     } catch (err) {
//       console.error('register: Error:', err.response?.status, err.response?.data); // Debug
//       throw new Error(err.response?.data?.error || "Registration failed");
//     }
//   };

//   const logout = async () => {
//     try {
//       console.log('logout: Attempting logout'); // Debug
//       await api.post('/auth/logout');
//       console.log('logout: Success'); // Debug
//       setUser(null);
//       navigate('/');
//     } catch (err) {
//       console.error('logout: Error:', err.response?.status, err.response?.data); // Debug
//       setUser(null);
//       navigate('/');
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, setUser, loading, login, register, logout }}
//     >
//       {loading ? (
//         <div className="min-h-screen flex items-center justify-center bg-gray-100">
//           <div className="text-gray-700">Loading...</div>
//         </div>
//       ) : (
//         children
//       )}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;

// import { createContext, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   const initializeAuth = async () => {
//     console.log("initializeAuth: Starting"); // Debug
//     try {
//       const response = await api.get("/auth/me");
//       console.log("initializeAuth: /auth/me response:", response.data); // Debug
//       setUser(response.data);
//     } catch (err) {
//       console.error(
//         "initializeAuth: Failed to fetch user:",
//         err.response?.status,
//         err.response?.data || err.message
//       );
//       setUser(null);
//       if (err.response?.status === 401) {
//         console.log("initializeAuth: 401 detected, redirecting to /login"); // Debug
//         navigate("/login");
//       }
//     } finally {
//       console.log("initializeAuth: Loading complete"); // Debug
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     initializeAuth();
//   }, []);

//   const login = async (email, password) => {
//     try {
//       // console.log("login: Attempting login for:", email); // Debug
//       const response = await api.post("/auth/login", { email, password });
//       // console.log("login: Login response:", response.data); // Debug
//       setUser(response.data.user);
//       console.log(user);
      
//       setLoading(false);
//       return response.data.user; // Return user for immediate access
//     } catch (err) {
//       console.error(
//         "login: Failed to login:",
//         err.response?.status,
//         err.response?.data || err.message
//       );
//       throw new Error(err.response?.data?.error || "Login failed");
//     }
//   };

//   const logout = async () => {
//     try {
//       console.log("logout: Attempting logout"); // Debug
//       await api.post("/auth/logout");
//       console.log("logout: Success"); // Debug
//       setUser(null);
//       navigate("/login");
//     } catch (err) {
//       console.error(
//         "logout: Failed to logout:",
//         err.response?.status,
//         err.response?.data || err.message
//       );
//       setUser(null);
//       navigate("/login");
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;

import { createContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initializeAuth = async () => {
    try {
      console.log("AuthContext: Initializing auth"); // Debug
      const response = await api.get("/auth/me");
      console.log("AuthContext: /auth/me response:", response.data); // Debug
      // console.log("response.data", response.data);
      // console.log("Response.data.user", response.data.user)
      
      setUser(response.data);
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
  }, []);

  const login = async (email, password) => {
    try {
      console.log("AuthContext: Logging in:", email); // Debug
      const response = await api.post("/auth/login", { email, password });
      console.log("AuthContext: Login response:", response.data); // Debug
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

  const logout = async () => {
    try {
      console.log("AuthContext: Logging out"); // Debug
      await api.post("/auth/logout");
      setUser(null);
    } catch (err) {
      console.error(
        "AuthContext: Logout error:",
        err.response?.status,
        err.response?.data || err.message
      );
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;