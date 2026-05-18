import React from "react";
import { AlertTriangle } from "lucide-react";
import { BaseModal } from "@/components/Modal";

interface ModalConfirmarDeletarProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  equipeName: string;
  enviando?: boolean;
}

export function ModalConfirmarDeletar({
  isOpen,
  onClose,
  onConfirm,
  equipeName,
  enviando = false,
}: ModalConfirmarDeletarProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Deleção"
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
            onClick={onConfirm}
            disabled={enviando}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-red-700"
          >
            {enviando ? "Deletando..." : "Deletar"}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-slate-700">
            Tem certeza que deseja deletar a equipe <strong>{equipeName}</strong>?
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Essa ação não pode ser desfeita. Todos os projetos e dados da equipe serão perdidos.
          </p>
        </div>
      </div>
    </BaseModal>
  );
}
