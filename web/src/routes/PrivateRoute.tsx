import { Navigate, Outlet } from "react-router-dom";
import { isAutenticado } from "@/services/auth";

/**
 * Valida se um JWT está expirado
 * @param token Token JWT em formato Bearer ou raw
 * @returns true se o token está expirado
 */
function isTokenExpirado(token: string): boolean {
  try {
    // Remove "Bearer " se houver
    const tokenLimpo = token.startsWith("Bearer ") ? token.slice(7) : token;
    
    // Decodifica o payload (parte do meio do JWT)
    const partes = tokenLimpo.split(".");
    if (partes.length !== 3) return true;

    // Decodifica a parte payload (segunda parte)
    const payload = JSON.parse(
      atob(partes[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    // Verifica se exp existe e está expirado
    if (payload.exp) {
      const expiracaoMs = payload.exp * 1000; // exp está em segundos
      return Date.now() >= expiracaoMs;
    }

    return false;
  } catch {
    // Se falhar em decodificar, considera expirado
    return true;
  }
}

export default function PrivateRoute() {
  const token = localStorage.getItem("flowsense_token");

  // Verifica se o token existe
  if (!token || isAutenticado() === false) {
    return <Navigate to="/login" />;
  }

  // Verifica se o token está expirado
  if (isTokenExpirado(token)) {
    localStorage.removeItem("flowsense_token");
    localStorage.removeItem("flowsense_user");
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}