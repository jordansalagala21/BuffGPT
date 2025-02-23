import React, { JSX } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Auth from "./components/auth";
import SetupForm from "./components/SetupForm";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./index.css";
import Dashboard from "./components/Dashboard";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [user] = useAuthState(auth);
  return user ? children : <Navigate to="/auth" />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <SetupForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
