import api from "@/services/api";
import type { Usuario } from "@/types";

interface PerfilResponse {
  usuario: Usuario;
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

/**
 * Persiste o usuário atualizado no localStorage para manter a sessão sincronizada.
 */
export function sincronizarUsuarioLocal(usuario: Usuario): void {
  localStorage.setItem("flowsense_user", JSON.stringify(usuario));
}
