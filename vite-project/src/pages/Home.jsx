import { useContext } from "react";
import AuthContext from "../context/AuthContext";

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          Welcome to LearnSphere
        </h1>
        {user ? (
          <p className="text-lg text-gray-700">
            Hello, <span className="font-semibold">{user.email}</span>! You are
            logged in as <span className="font-semibold">{user.role}</span>.
          </p>
        ) : (
          <p className="text-lg text-gray-700">
            Please log in or register to continue.
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;
