import { AlertTriangle } from "lucide-react";
import { BaseModal } from "@/components/Modal";

interface ModalConfirmarDeletarProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  equipeName: string;
  enviando?: boolean;
}

const BTN_CANCEL =
  "inline-flex h-9 items-center rounded-full border border-[#DDE7F3] px-4 text-sm font-bold text-[#42516A] transition hover:border-[#5B35F5] hover:text-[#5B35F5]";
const BTN_DANGER =
  "inline-flex h-9 items-center rounded-full bg-[#FF4F58] px-4 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50";

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
      title="Excluir equipe"
      size="sm"
      footer={
        <>
          <button onClick={onClose} className={BTN_CANCEL}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={enviando}
            className={BTN_DANGER}
          >
            {enviando ? "Excluindo..." : "Excluir"}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-[#FF4F58]" />
        <div>
          <p className="text-sm font-medium text-[#42516A]">
            Tem certeza que deseja excluir a equipe <strong>{equipeName}</strong>?
          </p>
          <p className="mt-2 text-xs leading-5 text-[#7E8DA6]">
            Essa ação não pode ser desfeita. Todos os projetos e dados da equipe serão perdidos.
          </p>
        </div>
      </div>
    </BaseModal>
  );
}
