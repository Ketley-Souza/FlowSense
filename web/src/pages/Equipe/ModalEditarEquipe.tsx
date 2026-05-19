import { useState, useEffect } from "react";
import { BaseModal } from "@/components/Modal";

const INPUT_CLS =
  "w-full rounded-xl border border-[#DDE7F3] px-3 py-2 text-sm text-[#202A3D] outline-none transition placeholder:text-[#9EB2CC] focus:border-[#5B35F5] focus:ring-2 focus:ring-[#5B35F5]/10";
const LABEL_CLS = "mb-1.5 block text-sm font-bold text-[#202A3D]";
const BTN_CANCEL =
  "inline-flex h-9 items-center rounded-full border border-[#DDE7F3] px-4 text-sm font-bold text-[#42516A] transition hover:border-[#5B35F5] hover:text-[#5B35F5]";
const BTN_PRIMARY =
  "inline-flex h-9 items-center rounded-full bg-[#5B35F5] px-4 text-sm font-bold text-white transition hover:bg-[#4D2DE0] disabled:opacity-50";

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

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = window.setTimeout(() => {
      setNome(nomeInicial);
      setDescricao(descricaoInicial);
    }, 0);

    return () => window.clearTimeout(timeoutId);
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
