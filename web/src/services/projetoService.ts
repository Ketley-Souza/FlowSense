import api from "@/services/api";
import type { ColunaKanban, Projeto, CriarProjetoPayload, AtualizarProjetoPayload, Usuario } from "@/store/types";

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

  listarUsuariosParaAdicionar: async (): Promise<Usuario[]> => {
    const { data } = await api.get<Usuario[]>("/projetos/usuarios-para-adicionar");
    return data;
  },

  criarColuna: async (projetoId: string, nome: string): Promise<ColunaKanban> => {
    const { data } = await api.post<ColunaKanban>(`/projetos/${projetoId}/colunas`, { nome });
    return data;
  },

  deletarColuna: async (projetoId: string, colunaId: string): Promise<void> => {
    await api.delete(`/projetos/${projetoId}/colunas/${colunaId}`);
  },

  //anexos do projeto
  listarAnexos: async (projetoId: string) => {
    const { data } = await api.get(`/projetos/${projetoId}/anexos`);
    return data;
  },

  adicionarAnexo: async (projetoId: string, arquivo: File) => {
    const formData = new FormData();
    formData.append("file", arquivo);
    const { data } = await api.post(`/projetos/${projetoId}/anexos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  deletarAnexo: async (projetoId: string, anexoId: string): Promise<void> => {
    await api.delete(`/projetos/${projetoId}/anexos/${anexoId}`);
  },
};


