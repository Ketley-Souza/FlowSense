import { create } from "zustand";
import { useEquipeStore } from "./useEquipeStore";

interface UsuariosStore {
  // Todas as ações foram movidas para useEquipeStore
}

export const useUsuariosStore = create<UsuariosStore>(() => ({}));

// Re-export do store de equipe para compatibilidade
export { useEquipeStore as usuariosStore };
