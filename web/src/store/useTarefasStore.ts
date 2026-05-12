import { create } from "zustand";
import type { Tarefa, CriarTarefaPayload, AtualizarTarefaPayload } from "./types";
import { tarefaService } from "@/services/tarefaService";

interface TarefasStore {
  tarefas: Tarefa[];
  carregando: boolean;
  erro: string | null;
  
  // Ações
  listar: () => Promise<void>;
  criar: (payload: CriarTarefaPayload) => Promise<Tarefa>;
  atualizar: (tarefaId: string, payload: AtualizarTarefaPayload) => Promise<Tarefa>;
  deletar: (tarefaId: string) => Promise<void>;
  limpar: () => void;
}

export const useTarefasStore = create<TarefasStore>((set: any) => ({
  tarefas: [],
  carregando: false,
  erro: null,

  listar: async () => {
    set({ carregando: true, erro: null });
    try {
      const tarefas = await tarefaService.listar();
      set({ tarefas });
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao listar tarefas";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  criar: async (payload: CriarTarefaPayload) => {
    set({ carregando: true, erro: null });
    try {
      const novaTarefa = await tarefaService.criar(payload);
      set((state: TarefasStore) => ({
        tarefas: [...state.tarefas, novaTarefa],
      }));
      return novaTarefa;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao criar tarefa";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  atualizar: async (tarefaId: string, payload: AtualizarTarefaPayload) => {
    set({ carregando: true, erro: null });
    try {
      const tarefaAtualizada = await tarefaService.atualizar(tarefaId, payload);
      set((state: TarefasStore) => ({
        tarefas: state.tarefas.map((t) => (t.id === tarefaId ? tarefaAtualizada : t)),
      }));
      return tarefaAtualizada;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao atualizar tarefa";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  deletar: async (tarefaId: string) => {
    set({ carregando: true, erro: null });
    try {
      await tarefaService.deletar(tarefaId);
      set((state: TarefasStore) => ({
        tarefas: state.tarefas.filter((t) => t.id !== tarefaId),
      }));
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao deletar tarefa";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  limpar: () => {
    set({ tarefas: [], carregando: false, erro: null });
  },
}));
