import api from "@/services/api";
import type { Equipe, Usuario, UsuarioEquipe } from "@/types";

export const equipeService = {
  listar: async (): Promise<Equipe[]> => {
    const { data } = await api.get<Equipe[]>("/equipes");
    return data;
  },

  criar: async (payload: {
    nome: string;
    descricao?: string;
  }): Promise<Equipe> => {
    const { data } = await api.post<Equipe>("/equipes", payload);
    return data;
  },

  atualizar: async (
    equipeId: string,
    payload: { nome?: string; descricao?: string }
  ): Promise<Equipe> => {
    const { data } = await api.patch<Equipe>(`/equipes/${equipeId}`, payload);
    return data;
  },

  deletar: async (equipeId: string): Promise<void> => {
    await api.delete(`/equipes/${equipeId}`);
  },

  convidarMembro: async (
    equipeId: string,
    payload: {
      nome: string;
      email: string;
      cargo: "GERENTE" | "MEMBRO";
    }
  ): Promise<void> => {
    await api.post(`/equipes/${equipeId}/convidar`, payload);
  },

  listarMembros: async (equipeId: string): Promise<UsuarioEquipe[]> => {
    const { data } = await api.get<UsuarioEquipe[]>(`/equipes/${equipeId}/membros`);
    return data;
  },

  listarMembrosDisponiveis: async (): Promise<Usuario[]> => {
    const { data } = await api.get<Usuario[]>("/membros-disponiveis");
    return data;
  },

  removerMembro: async (equipeId: string, membroId: string): Promise<void> => {
    await api.delete(`/equipes/${equipeId}/membros/${membroId}`);
  },

  alterarCargo: async (
    equipeId: string,
    membroId: string,
    cargo: "ADMIN" | "GERENTE" | "MEMBRO"
  ): Promise<UsuarioEquipe> => {
    const { data } = await api.patch<UsuarioEquipe>(
      `/equipes/${equipeId}/membros/${membroId}`,
      { cargo }
    );
    return data;
  },
};
