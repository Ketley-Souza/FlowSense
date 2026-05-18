/**
 * Contexto de notificações (toast)
 * Substitui alert() e permite notificações elegantes
 */

import React, { createContext, useContext, useState, useCallback } from "react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notificacao {
  id: string;
  tipo: NotificationType;
  mensagem: string;
  duracao?: number; // em ms, 0 = permanente
}

interface NotificacaoContextType {
  notificacoes: Notificacao[];
  adicionarNotificacao: (tipo: NotificationType, mensagem: string, duracao?: number) => void;
  removerNotificacao: (id: string) => void;
  limpar: () => void;
}

const NotificacaoContext = createContext<NotificacaoContextType | undefined>(undefined);

export function NotificacaoProvider({ children }: { children: React.ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  const removerNotificacao = useCallback((id: string) => {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const adicionarNotificacao = useCallback(
    (tipo: NotificationType, mensagem: string, duracao = 5000) => {
      const id = `${Date.now()}-${Math.random()}`;
      setNotificacoes((prev) => [...prev, { id, tipo, mensagem, duracao }]);

      if (duracao > 0) {
        setTimeout(() => removerNotificacao(id), duracao);
      }
    },
    [removerNotificacao]
  );

  const limpar = useCallback(() => {
    setNotificacoes([]);
  }, []);

  return (
    <NotificacaoContext.Provider
      value={{ notificacoes, adicionarNotificacao, removerNotificacao, limpar }}
    >
      {children}
    </NotificacaoContext.Provider>
  );
}

export function useNotificacao() {
  const context = useContext(NotificacaoContext);
  if (!context) {
    throw new Error("useNotificacao deve ser usado dentro de NotificacaoProvider");
  }
  return context;
}
