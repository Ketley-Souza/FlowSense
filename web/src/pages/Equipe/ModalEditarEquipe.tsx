import { useState, useEffect } from "react";
import { BaseModal } from "@/components/Modal";

const INPUT_CLS =
  "w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200/70";
const LABEL_CLS = "block text-sm font-medium text-slate-700 mb-1.5";
const BTN_CANCEL =
  "inline-flex h-9 items-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50";
const BTN_PRIMARY =
  "inline-flex h-9 items-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50";

interface ModalEditarEquipeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nome: string, descricao: string) => void;
  nomeInicial: string;
  descricaoInicial: string;
  enviando?: boolean;
}

export function ModalEditarEquipe({
  isOpen,
  onClose,
  onSubmit,
  nomeInicial,
  descricaoInicial,
  enviando = false,
}: ModalEditarEquipeProps) {
  const [nome, setNome] = useState(nomeInicial);
  const [descricao, setDescricao] = useState(descricaoInicial);

  // Sincroniza com props ao abrir
  useEffect(() => {
    if (isOpen) {
      setNome(nomeInicial);
      setDescricao(descricaoInicial);
    }
  }, [isOpen, nomeInicial, descricaoInicial]);

  function handleSubmit() {
    if (!nome.trim()) return;
    onSubmit(nome.trim(), descricao.trim());
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar equipe"
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
            {enviando ? "Salvando…" : "Salvar alterações"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={LABEL_CLS}>Nome da equipe</label>
          <input
            id="editar-equipe-nome"
            className={INPUT_CLS}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
            autoComplete="off"
          />
        </div>

        <div>
          <label className={LABEL_CLS}>
            Descrição{" "}
            <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <textarea
            id="editar-equipe-descricao"
            className={`${INPUT_CLS} resize-none`}
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Para que serve esta equipe?"
          />
        </div>
      </div>
    </BaseModal>
  );
}
