import { X } from "lucide-react";
import { useState, useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  tipo: ToastType;
  mensagem: string;
  duracao?: number;
}

interface ToastProps {
  items: ToastItem[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ items, onRemove }: ToastProps) {
  const cores = {
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  const icones = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ⓘ",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-start gap-3 p-4 rounded-lg border animate-in fade-in slide-in-from-bottom-4 ${cores[item.tipo]}`}
        >
          <span className="flex-shrink-0 text-lg font-bold">
            {icones[item.tipo]}
          </span>
          <p className="flex-1 text-sm font-medium">{item.mensagem}</p>
          <button
            onClick={() => onRemove(item.id)}
            className="flex-shrink-0 hover:opacity-70"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const exibir = (tipo: ToastType, mensagem: string, duracao = 5000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, tipo, mensagem, duracao }]);

    if (duracao > 0) {
      setTimeout(() => remover(id), duracao);
    }
  };

  const remover = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    exibir,
    remover,
    sucesso: (msg: string, duracao?: number) => exibir("success", msg, duracao),
    erro: (msg: string, duracao?: number) => exibir("error", msg, duracao),
    aviso: (msg: string, duracao?: number) => exibir("warning", msg, duracao),
    info: (msg: string, duracao?: number) => exibir("info", msg, duracao),
  };
}
