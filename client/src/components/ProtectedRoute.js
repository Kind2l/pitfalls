import { useAuth } from "@Context/SocketContext";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/connection" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
