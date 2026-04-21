import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const isAuthenticated = true; // depois: redux ou token

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}