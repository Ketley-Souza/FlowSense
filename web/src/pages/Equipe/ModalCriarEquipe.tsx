import React from "react";
import { BaseModal } from "@/components/Modal";

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
  const [nome, setNome] = React.useState("");

  const handleSubmit = () => {
    if (!nome.trim()) {
      return;
    }
    onSubmit(nome);
    setNome("");
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Nova Equipe"
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
            {enviando ? "Criando..." : "Criar"}
          </button>
        </>
      }
    >
      <div>
        <label className="text-sm block mb-2 font-medium">Nome da Equipe</label>
        <input
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          placeholder="Digite o nome da equipe"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>
    </BaseModal>
  );
}
