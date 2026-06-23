import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface CreateColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nome: string) => Promise<void>;
}

export function CreateColumnModal({ isOpen, onClose, onSubmit }: CreateColumnModalProps) {
  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (isOpen) setNome("");
  }, [isOpen]);

  async function handleSubmit() {
    if (!nome.trim()) return;
    setCarregando(true);
    try {
      await onSubmit(nome.trim());
      onClose();
    } finally {
      setCarregando(false);
    }
  }

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#EEF2F8] px-6 py-4">
          <h2 className="text-lg font-bold text-[#202A3D]">Criar Coluna</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-[#7E8DA6] hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <label className="mb-1.5 block text-sm font-semibold text-[#202A3D]">
            Nome da coluna <span className="text-[#FF4F58]">*</span>
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="Ex: Em Revisão"
            autoFocus
            className="w-full rounded-xl border border-[#DDE7F3] bg-[#F8FBFF] px-3.5 py-2.5 text-sm text-[#202A3D] placeholder-[#9EB2CC] outline-none focus:border-[#5B35F5] focus:ring-2 focus:ring-[#5B35F5]/10"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-[#EEF2F8] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-[#DDE7F3] px-5 text-sm font-semibold text-[#40506A] hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={carregando || !nome.trim()}
            className="h-10 rounded-xl bg-[#5B35F5] px-6 text-sm font-bold text-white hover:bg-[#4D2DE0] disabled:opacity-50"
          >
            {carregando ? "Criando..." : "Criar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
