import api from "@/services/api";
import type {
  AtualizarTarefaPayload,
  CriarAnexoPayload,
  CriarComentarioPayload,
  CriarTarefaPayload,
  Tarefa,
} from "@/store/types";

export const tarefaService = {
  listar: async (): Promise<Tarefa[]> => {
    const { data } = await api.get<Tarefa[]>("/tarefas");
    return data;
  },

  listarPorProjeto: async (projetoId: string): Promise<Tarefa[]> => {
    const { data } = await api.get<Tarefa[]>(`/projetos/${projetoId}/tarefas`);
    return data;
  },

  criar: async (payload: CriarTarefaPayload): Promise<Tarefa> => {
    const { data } = await api.post<Tarefa>("/tarefas", payload);
    return data;
  },

  atualizar: async (tarefaId: string, payload: AtualizarTarefaPayload): Promise<Tarefa> => {
    const { data } = await api.patch<Tarefa>(`/tarefas/${tarefaId}`, payload);
    return data;
  },

  adicionarComentario: async (
    tarefaId: string,
    payload: CriarComentarioPayload
  ): Promise<Tarefa> => {
    const { data } = await api.post<Tarefa>(
      `/tarefas/${tarefaId}/comentarios`,
      payload
    );
    return data;
  },

  adicionarAnexo: async (
    tarefaId: string,
    payload: CriarAnexoPayload
  ): Promise<Tarefa> => {
    const { data } = await api.post<Tarefa>(`/tarefas/${tarefaId}/anexos`, payload);
    return data;
  },

  deletar: async (tarefaId: string): Promise<void> => {
    await api.delete(`/tarefas/${tarefaId}`);
  },
};
