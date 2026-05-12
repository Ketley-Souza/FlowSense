import { create } from "zustand";
import api from "@/services/api";

interface Equipe {
  id: string;
  nome: string;
  descricao?: string;
  dono_id: string;
  usuarios?: any[];
}

interface EquipesStore {
  equipes: Equipe[];
  equipeAtiva: Equipe | null;
  carregando: boolean;
  erro: string | null;

  // Ações
  listar: () => Promise<void>;
  criar: (data: { nome: string; descricao?: string }) => Promise<Equipe>;
  definirAtiva: (equipe: Equipe) => void;
  convidarMembro: (
    equipeId: string,
    data: { nome: string; email: string; cargo: "GERENTE" | "MEMBRO" }
  ) => Promise<void>;
  listarMembros: (equipeId: string) => Promise<any[]>;
}

export const useEquipesStore = create<EquipesStore>((set, get) => ({
  equipes: [],
  equipeAtiva: null,
  carregando: false,
  erro: null,

  listar: async () => {
    set({ carregando: true, erro: null });
    try {
      const { data } = await api.get<Equipe[]>("/equipes");
      set({ equipes: data });

      // Definir primeira equipe como ativa se houver
      if (data.length > 0 && !get().equipeAtiva) {
        set({ equipeAtiva: data[0] });
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
      const { data: novaEquipe } = await api.post<Equipe>("/equipes", data);
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
      await api.post(`/equipes/${equipeId}/convidar`, data);
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
      const { data: membros } = await api.get(`/equipes/${equipeId}/membros`);
      return membros;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao listar membros";
      set({ erro: mensagem });
      throw error;
    } finally {
      set({ carregando: false });
    }
  },
}));
