import React from "react";
import { BaseModal } from "@/components/Modal";

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
  const [nome, setNome] = React.useState(nomeInicial);
  const [descricao, setDescricao] = React.useState(descricaoInicial);

  React.useEffect(() => {
    setNome(nomeInicial);
    setDescricao(descricaoInicial);
  }, [nomeInicial, descricaoInicial, isOpen]);

  const handleSubmit = () => {
    if (!nome.trim()) {
      return;
    }
    onSubmit(nome, descricao);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Equipe"
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={enviando || !nome.trim()}
            className="px-4 py-2 bg-[#4f35f5] text-white rounded-lg text-sm disabled:opacity-50"
          >
            {enviando ? "Salvando..." : "Salvar"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm block mb-2 font-medium">Nome da Equipe</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm block mb-2 font-medium">Descrição</label>
          <textarea
            className="w-full border border-slate-300 rounded-lg px-3 py-2 resize-none"
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição da equipe (opcional)"
          />
        </div>
      </div>
    </BaseModal>
  );
}
