import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import { AuthProvider } from "./context/AuthContext";
import InstructorDashboard from "./pages/InstructorDashboard";
import CreateCourse from "./pages/CreateCourse";
import EditCourse from "./pages/EditCourse";
import CourseDetails from "./pages/CourseDetails";
import ManageSessions from "./pages/ManageSessions";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/courses/new" element={< CreateCourse />} />
        <Route path="/instructor/courses/edit/:id" element={< EditCourse />} />
        <Route path="/instructor/courses/:courseId" element={<CourseDetails />} />
        <Route path="/instructor/courses/:courseId/sessions" element={< ManageSessions />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
