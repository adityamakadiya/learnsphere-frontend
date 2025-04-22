import { useContext } from "react";
import AuthContext from "../context/AuthContext";

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/10">
      <div className="text-center p-8 rounded-modern shadow-modern bg-white max-w-3xl mx-4">
        <h1 className="text-5xl font-extrabold mb-6 text-primary">Welcome to LearnSphere</h1>
        {user ? (
          <p className="text-lg text-secondary">
            Hello, {user.email}! You are logged in as {user.role}.
          </p>
        ) : (
          <p className="text-lg text-secondary">Please log in or register to continue.</p>
        )}
      </div>
    </div>
  );
}

export default Home;
