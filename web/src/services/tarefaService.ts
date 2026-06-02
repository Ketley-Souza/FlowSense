import api from "@/services/api";
import type {
  AtualizarTarefaPayload,
  Anexo,
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

  //listar anexos da tarefa
  listarAnexos: async (tarefaId: string): Promise<Anexo[]> => {
    const { data } = await api.get<Anexo[]>(`/tarefas/${tarefaId}/anexos`);
    return data;
  },

  //add anexo por upload
  adicionarAnexo: async (tarefaId: string, arquivo: File): Promise<Tarefa> => {
    const formData = new FormData();
    formData.append("file", arquivo);
    const { data } = await api.post<Tarefa>(`/tarefas/${tarefaId}/anexos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  //deletar
  deletarAnexo: async (tarefaId: string, anexoId: string): Promise<void> => {
    await api.delete(`/tarefas/${tarefaId}/anexos/${anexoId}`);
  },

  deletar: async (tarefaId: string): Promise<void> => {
    await api.delete(`/tarefas/${tarefaId}`);
  },
};
