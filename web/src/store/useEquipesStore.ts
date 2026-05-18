import { create } from "zustand";
import { equipeService } from "@/services/equipeService";
import type { Equipe, Usuario, UsuarioEquipe, CargoConvite } from "@/types";

interface EquipesStore {
  equipes: Equipe[];
  equipeAtiva: Equipe | null;
  usuarios: UsuarioEquipe[];
  carregando: boolean;
  erro: string | null;
  membrosDisponiveis: Usuario[];

  // Ações
  listar: () => Promise<void>;
  criar: (data: { nome: string; descricao?: string }) => Promise<Equipe>;
  definirAtiva: (equipe: Equipe) => void;
  atualizar: (equipeId: string, data: { nome?: string; descricao?: string }) => Promise<Equipe>;
  deletar: (equipeId: string) => Promise<void>;
  convidarMembro: (
    equipeId: string,
    data: { nome: string; email: string; cargo: CargoConvite }
  ) => Promise<void>;
  listarMembros: (equipeId: string) => Promise<UsuarioEquipe[]>;
  listarMembrosDisponiveis: () => Promise<Usuario[]>;
}

export const useEquipesStore = create<EquipesStore>((set, get) => ({
  equipes: [],
  equipeAtiva: null,
  usuarios: [],
  carregando: false,
  erro: null,
  membrosDisponiveis: [],

  listar: async () => {
    set({ carregando: true, erro: null });
    try {
      const equipes = await equipeService.listar();
      set({ equipes });

      // Definir primeira equipe como ativa se houver
      if (equipes.length > 0 && !get().equipeAtiva) {
        set({ equipeAtiva: equipes[0] });
      }
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao listar equipes";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  criar: async (data) => {
    set({ carregando: true, erro: null });
    try {
      const novaEquipe = await equipeService.criar(data);
      set((state) => ({
        equipes: [...state.equipes, novaEquipe],
        equipeAtiva: novaEquipe,
      }));
      return novaEquipe;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao criar equipe";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  definirAtiva: (equipe) => {
    set({ equipeAtiva: equipe });
  },

  convidarMembro: async (equipeId, data) => {
    set({ carregando: true, erro: null });
    try {
      await equipeService.convidarMembro(equipeId, data);
      // Recarregar membros da equipe
      await get().listarMembros(equipeId);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao convidar membro";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  listarMembros: async (equipeId) => {
    set({ carregando: true, erro: null });
    try {
      const membros = await equipeService.listarMembros(equipeId);
      set({ usuarios: membros });
      return membros;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao listar membros";
      set({ erro: mensagem, usuarios: [] });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  atualizar: async (equipeId, data) => {
    set({ carregando: true, erro: null });
    try {
      const equipeAtualizada = await equipeService.atualizar(equipeId, data);
      set((state) => ({
        equipes: state.equipes.map((eq) =>
          eq.id === equipeId ? equipeAtualizada : eq
        ),
        equipeAtiva:
          state.equipeAtiva?.id === equipeId ? equipeAtualizada : state.equipeAtiva,
      }));
      return equipeAtualizada;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao atualizar equipe";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  deletar: async (equipeId) => {
    set({ carregando: true, erro: null });
    try {
      await equipeService.deletar(equipeId);
      set((state) => ({
        equipes: state.equipes.filter((eq) => eq.id !== equipeId),
        equipeAtiva:
          state.equipeAtiva?.id === equipeId ? null : state.equipeAtiva,
      }));
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao deletar equipe";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  listarMembrosDisponiveis: async () => {
    set({ carregando: true, erro: null });
    try {
      const membros = await equipeService.listarMembrosDisponiveis();
      set({ membrosDisponiveis: membros });
      return membros;
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao listar membros disponíveis";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },
}));
