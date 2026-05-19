import { useState, useEffect } from "react";
import { BaseModal } from "@/components/Modal";

const INPUT_CLS =
  "w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200/70";
const LABEL_CLS = "block text-sm font-medium text-slate-700 mb-1.5";
const BTN_CANCEL =
  "inline-flex h-9 items-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50";
const BTN_PRIMARY =
  "inline-flex h-9 items-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50";

interface ModalCriarEquipeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nome: string) => void;
  enviando?: boolean;
}

export function ModalCriarEquipe({
  isOpen,
  onClose,
  onSubmit,
  enviando = false,
}: ModalCriarEquipeProps) {
  const [nome, setNome] = useState("");

  useEffect(() => {
    if (!isOpen) setNome("");
  }, [isOpen]);

  function handleSubmit() {
    if (!nome.trim()) return;
    onSubmit(nome.trim());
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova equipe"
      size="sm"
      footer={
        <>
          <button onClick={onClose} className={BTN_CANCEL}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={enviando || !nome.trim()}
            className={BTN_PRIMARY}
          >
            {enviando ? "Criando…" : "Criar equipe"}
          </button>
        </>
      }
    >
      <div>
        <label className={LABEL_CLS}>Nome da equipe</label>
        <input
          id="criar-equipe-nome"
          className={INPUT_CLS}
          placeholder="ex. Design, Engenharia…"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
          autoComplete="off"
        />
      </div>
    </BaseModal>
  );
}
