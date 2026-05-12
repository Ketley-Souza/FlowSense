import api from "@/services/api";
import type { Projeto, CriarProjetoPayload, AtualizarProjetoPayload, Usuario } from "@/store/types";

export const projetoService = {
  listar: async (): Promise<Projeto[]> => {
    const { data } = await api.get<Projeto[]>("/projetos");
    return data;
  },

  obter: async (projetoId: string): Promise<Projeto> => {
    const { data } = await api.get<Projeto>(`/projetos/${projetoId}`);
    return data;
  },

  criar: async (payload: CriarProjetoPayload): Promise<Projeto> => {
    const { data } = await api.post<Projeto>("/projetos", payload);
    return data;
  },

  atualizar: async (projetoId: string, payload: AtualizarProjetoPayload): Promise<Projeto> => {
    const { data } = await api.patch<Projeto>(`/projetos/${projetoId}`, payload);
    return data;
  },

  deletar: async (projetoId: string): Promise<void> => {
    await api.delete(`/projetos/${projetoId}`);
  },

  adicionarMembro: async (
    projetoId: string,
    usuarioId: string,
    cargo: "GERENTE" | "MEMBRO"
  ): Promise<void> => {
    await api.post(`/projetos/${projetoId}/membros`, {
      id_usuario: usuarioId,
      cargo,
    });
  },

  removerMembro: async (projetoId: string, usuarioId: string): Promise<void> => {
    await api.delete(`/projetos/${projetoId}/membros/${usuarioId}`);
  },

  atualizarCargoMembro: async (
    projetoId: string,
    usuarioId: string,
    cargo: "GERENTE" | "MEMBRO"
  ): Promise<void> => {
    await api.patch(`/projetos/${projetoId}/membros/${usuarioId}`, { cargo });
  },

  listarUsuarios: async (): Promise<Usuario[]> => {
    const { data } = await api.get<Usuario[]>("/usuarios");
    return data;
  },
};
