/**
 * ToastContext — Toast global disponível em toda a aplicação
 * Uso: const toast = useToastGlobal(); toast.sucesso("..."); toast.erro("...");
 * Renderiza o ToastContainer automaticamente dentro do provider
 */
import { createContext, useContext, useState, ReactNode } from "react";
import { ToastContainer } from "@/components/Toast";
import type { ToastItem, ToastType } from "@/components/Toast";

interface ToastContextType {
  exibir: (tipo: ToastType, mensagem: string, duracao?: number) => void;
  sucesso: (msg: string, duracao?: number) => void;
  erro: (msg: string, duracao?: number) => void;
  aviso: (msg: string, duracao?: number) => void;
  info: (msg: string, duracao?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remover = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const exibir = (tipo: ToastType, mensagem: string, duracao = 5000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, tipo, mensagem, duracao }]);
    if (duracao > 0) setTimeout(() => remover(id), duracao);
  };

  const value: ToastContextType = {
    exibir,
    sucesso: (msg, dur) => exibir("success", msg, dur),
    erro: (msg, dur) => exibir("error", msg, dur),
    aviso: (msg, dur) => exibir("warning", msg, dur),
    info: (msg, dur) => exibir("info", msg, dur),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer items={toasts} onRemove={remover} />
    </ToastContext.Provider>
  );
}

export function useToastGlobal(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastGlobal deve ser usado dentro de ToastProvider");
  return ctx;
}
