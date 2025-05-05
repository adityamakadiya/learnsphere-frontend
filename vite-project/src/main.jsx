import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";

try{
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <BrowserRouter>
        <GoogleOAuthProvider clientId="654482025152-clsms47b79fjsi025bhf34f7isvc3uju.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}catch{
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <BrowserRouter>
        <GoogleOAuthProvider clientId="654482025152-clsms47b79fjsi025bhf34f7isvc3uju.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
