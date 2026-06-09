import api from "@/services/api";
import type { PreferenciasUsuario, Usuario } from "@/types";

interface PerfilResponse {
  usuario: Usuario;
}

interface PreferenciasResponse {
  preferencias: PreferenciasUsuario;
}

export const PREFERENCIAS_PADRAO: Required<PreferenciasUsuario> = {
  notif_plataforma: true,
  notif_push: false,
  notif_tarefas: true,
  notif_comentarios: true,
};

export function normalizarPreferencias(
  preferencias?: PreferenciasUsuario | null
): Required<PreferenciasUsuario> {
  return { ...PREFERENCIAS_PADRAO, ...(preferencias ?? {}) };
}

export async function obterPerfil(): Promise<Usuario> {
  const { data } = await api.get<PerfilResponse>("/usuarios/perfil");
  return data.usuario;
}

/**
 * Envia uma imagem como multipart para atualizar o avatar do usuário logado.
 * Retorna o usuário atualizado (incluindo a nova foto_url).
 */
export async function atualizarAvatar(arquivo: File): Promise<Usuario> {
  const formData = new FormData();
  formData.append("foto", arquivo);

  const { data } = await api.patch<PerfilResponse>(
    "/usuarios/perfil/avatar",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return data.usuario;
}

/**
 * Atualiza nome e/ou email do usuário logado.
 */
export async function atualizarPerfil(payload: {
  nome?: string;
  email?: string;
}): Promise<Usuario> {
  const { data } = await api.patch<PerfilResponse>(
    "/usuarios/perfil",
    payload
  );
  return data.usuario;
}

export async function alterarSenha(payload: {
  senha_atual: string;
  nova_senha: string;
}): Promise<void> {
  await api.patch("/usuarios/perfil/senha", payload);
}

export async function salvarPreferencias(
  payload: Partial<PreferenciasUsuario>
): Promise<PreferenciasUsuario> {
  const { data } = await api.patch<PreferenciasResponse>(
    "/usuarios/perfil/preferencias",
    payload
  );
  return normalizarPreferencias(data.preferencias);
}

/**
 * Persiste o usuário atualizado no localStorage para manter a sessão sincronizada.
 */
export function sincronizarUsuarioLocal(usuario: Usuario): void {
  localStorage.setItem("flowsense_user", JSON.stringify(usuario));
  window.dispatchEvent(new CustomEvent("usuario-atualizado", { detail: usuario }));
}
