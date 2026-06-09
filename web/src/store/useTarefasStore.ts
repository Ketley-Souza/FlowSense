import { create } from "zustand";
import type {
  AtualizarTarefaPayload,
  CriarComentarioPayload,
  CriarTarefaPayload,
  Tarefa,
} from "./types";
import { tarefaService } from "@/services/tarefaService";

interface TarefasStore {
  tarefas: Tarefa[];
  carregando: boolean;
  erro: string | null;

  listar: () => Promise<void>;
  listarPorProjeto: (projetoId: string) => Promise<void>;
  criar: (payload: CriarTarefaPayload) => Promise<Tarefa>;
  atualizar: (tarefaId: string, payload: AtualizarTarefaPayload) => Promise<Tarefa>;
  adicionarComentario: (
    tarefaId: string,
    payload: CriarComentarioPayload
  ) => Promise<Tarefa>;
  adicionarAnexo: (tarefaId: string, arquivo: File) => Promise<Tarefa>;
  deletarAnexo: (tarefaId: string, anexoId: string) => Promise<void>;
  deletar: (tarefaId: string) => Promise<void>;
  moverTarefa: (tarefaId: string, novoColumnId: string | null) => void;
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

  listarPorProjeto: async (projetoId: string) => {
    set({ carregando: true, erro: null });
    try {
      const tarefas = await tarefaService.listarPorProjeto(projetoId);
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

  adicionarComentario: async (
    tarefaId: string,
    payload: CriarComentarioPayload
  ) => {
    set({ carregando: true, erro: null });
    try {
      const tarefaAtualizada = await tarefaService.adicionarComentario(
        tarefaId,
        payload
      );
      set((state: TarefasStore) => ({
        tarefas: state.tarefas.map((t) =>
          t.id === tarefaId ? tarefaAtualizada : t
        ),
      }));
      return tarefaAtualizada;
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao adicionar comentario";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  adicionarAnexo: async (tarefaId: string, arquivo: File) => {
    set({ carregando: true, erro: null });
    try {
      const tarefaAtualizada = await tarefaService.adicionarAnexo(
        tarefaId,
        arquivo
      );
      set((state: TarefasStore) => ({
        tarefas: state.tarefas.map((t) =>
          t.id === tarefaId ? tarefaAtualizada : t
        ),
      }));
      return tarefaAtualizada;
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao adicionar anexo";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  deletarAnexo: async (tarefaId: string, anexoId: string) => {
    try {
      await tarefaService.deletarAnexo(tarefaId, anexoId);
      set((state: TarefasStore) => ({
        tarefas: state.tarefas.map((t) =>
          t.id === tarefaId
            ? { ...t, anexos: (t.anexos ?? []).filter((a) => a.id !== anexoId) }
            : t
        ),
      }));
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao deletar anexo";
      set({ erro: mensagem });
      throw error;
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

  moverTarefa: (tarefaId: string, novoColumnId: string | null) => {
    set((state: TarefasStore) => ({
      tarefas: state.tarefas.map((t) => {
        if (t.id !== tarefaId) return t;
        return {
          ...t,
          id_coluna: novoColumnId,
          coluna: t.coluna ? { ...t.coluna, id: novoColumnId ?? t.coluna.id } : t.coluna,
        };
      }),
    }));
  },

  limpar: () => {
    set({ tarefas: [], carregando: false, erro: null });
  },
}));
