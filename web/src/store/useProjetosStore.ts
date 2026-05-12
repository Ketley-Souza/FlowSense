import { create } from "zustand";
import type { Projeto, CriarProjetoPayload, AtualizarProjetoPayload } from "./types";
import { projetoService } from "@/services/projetoService";

interface ProjetosStore {
  projetos: Projeto[];
  projetoAtual: Projeto | null;
  carregando: boolean;
  erro: string | null;

  // Ações
  listar: () => Promise<void>;
  obter: (projetoId: string) => Promise<Projeto>;
  criar: (payload: CriarProjetoPayload) => Promise<Projeto>;
  atualizar: (projetoId: string, payload: AtualizarProjetoPayload) => Promise<Projeto>;
  deletar: (projetoId: string) => Promise<void>;
  adicionarMembro: (projetoId: string, usuarioId: string, cargo: "GERENTE" | "MEMBRO") => Promise<void>;
  removerMembro: (projetoId: string, usuarioId: string) => Promise<void>;
  definirProjetoAtivo: (projeto: Projeto | null) => void;
  limpar: () => void;
}

export const useProjetosStore = create<ProjetosStore>((set: any) => ({
  projetos: [],
  projetoAtual: null,
  carregando: false,
  erro: null,

  listar: async () => {
    set({ carregando: true, erro: null });
    try {
      const projetos = await projetoService.listar();
      set({ projetos });
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao listar projetos";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  obter: async (projetoId: string) => {
    set({ carregando: true, erro: null });
    try {
      const projetoAtual = await projetoService.obter(projetoId);
      set({ projetoAtual });
      return projetoAtual;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao obter projeto";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  criar: async (payload: CriarProjetoPayload) => {
    set({ carregando: true, erro: null });
    try {
      const novoProjeto = await projetoService.criar(payload);
      set((state: ProjetosStore) => ({
        projetos: [...state.projetos, novoProjeto],
      }));
      return novoProjeto;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao criar projeto";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  atualizar: async (projetoId: string, payload: AtualizarProjetoPayload) => {
    set({ carregando: true, erro: null });
    try {
      const projetoAtualizado = await projetoService.atualizar(projetoId, payload);
      set((state: ProjetosStore) => ({
        projetos: state.projetos.map((p) => (p.id === projetoId ? projetoAtualizado : p)),
        projetoAtual: state.projetoAtual?.id === projetoId ? projetoAtualizado : state.projetoAtual,
      }));
      return projetoAtualizado;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao atualizar projeto";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  deletar: async (projetoId: string) => {
    set({ carregando: true, erro: null });
    try {
      await projetoService.deletar(projetoId);
      set((state: ProjetosStore) => ({
        projetos: state.projetos.filter((p) => p.id !== projetoId),
        projetoAtual: state.projetoAtual?.id === projetoId ? null : state.projetoAtual,
      }));
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao deletar projeto";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  adicionarMembro: async (projetoId: string, usuarioId: string, cargo: "GERENTE" | "MEMBRO") => {
    set({ carregando: true, erro: null });
    try {
      await projetoService.adicionarMembro(projetoId, usuarioId, cargo);
      const projetoAtualizado = await projetoService.obter(projetoId);
      set((state: ProjetosStore) => ({
        projetos: state.projetos.map((p) => (p.id === projetoId ? projetoAtualizado : p)),
        projetoAtual: state.projetoAtual?.id === projetoId ? projetoAtualizado : state.projetoAtual,
      }));
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao adicionar membro";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  removerMembro: async (projetoId: string, usuarioId: string) => {
    set({ carregando: true, erro: null });
    try {
      await projetoService.removerMembro(projetoId, usuarioId);
      const projetoAtualizado = await projetoService.obter(projetoId);
      set((state: ProjetosStore) => ({
        projetos: state.projetos.map((p) => (p.id === projetoId ? projetoAtualizado : p)),
        projetoAtual: state.projetoAtual?.id === projetoId ? projetoAtualizado : state.projetoAtual,
      }));
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao remover membro";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  definirProjetoAtivo: (projeto: Projeto | null) => {
    set({ projetoAtual: projeto });
  },

  limpar: () => {
    set({ projetos: [], projetoAtual: null, carregando: false, erro: null });
  },
}));

