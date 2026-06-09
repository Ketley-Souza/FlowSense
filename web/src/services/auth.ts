import api from "./api";
import type { Usuario, LoginResponse, RegisterResponse } from "@/types";

export async function login(
  identificador: string,
  senha: string
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", {
    identificador,
    senha,
  });

  localStorage.setItem("flowsense_token", data.token);
  localStorage.setItem("flowsense_user", JSON.stringify(data.usuario));

  return data;
}

export async function registrar(payload: {
  nome: string;
  email: string;
  login: string;
  senha: string;
}): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/auth/register", payload);
  return data;
}

//formdata pra upload
export async function registrarComFormData(
  formData: FormData
): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/auth/register", formData, {
    // Definir como undefined força o navegador a gerar o header correto com o boundary
    headers: { "Content-Type": undefined },
  });
  return data;
}

export function logout(): void {
  localStorage.removeItem("flowsense_token");
  localStorage.removeItem("flowsense_user");
}

export function getUsuarioLogado(): Usuario | null {
  const raw = localStorage.getItem("flowsense_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}

export function isAutenticado(): boolean {
  return !!localStorage.getItem("flowsense_token");
}