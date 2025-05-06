import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";

const Google_Client_Id =
  "478342189738-k0ocoa26jsp3jl2l6sku7cgcojmmpjlp.apps.googleusercontent.com";

try{
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <BrowserRouter>
        <GoogleOAuthProvider clientId = {Google_Client_Id}>
          <App />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}catch{
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={Google_Client_Id}>
          <App />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
