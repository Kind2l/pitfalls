import { useAuth } from "@Context/SocketContext";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    console.log("Non connecté, accès à la route non autorisé");
    return <Navigate to="/connection" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
