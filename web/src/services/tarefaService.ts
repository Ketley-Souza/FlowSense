import api from "@/services/api";
import type { Tarefa, CriarTarefaPayload, AtualizarTarefaPayload } from "@/store/types";

export const tarefaService = {
  listar: async (): Promise<Tarefa[]> => {
    const { data } = await api.get<Tarefa[]>("/tarefas");
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

  deletar: async (tarefaId: string): Promise<void> => {
    await api.delete(`/tarefas/${tarefaId}`);
  },
};
