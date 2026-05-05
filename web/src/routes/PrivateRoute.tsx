import { Navigate, Outlet } from "react-router-dom";
import { isAutenticado } from "@/services/auth";

export default function PrivateRoute() {
  return isAutenticado() ? <Outlet /> : <Navigate to="/login" />;
}