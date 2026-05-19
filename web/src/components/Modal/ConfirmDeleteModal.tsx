/**
 * ConfirmDeleteModal — Modal genérico de confirmação de exclusão
 * Baseado em BaseModal, reutilizável em qualquer página
 */
import { AlertTriangle } from "lucide-react";
import { BaseModal } from "@/components/Modal";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Exclusão",
  description,
  confirmLabel = "Excluir",
  loading = false,
}: ConfirmDeleteModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-[37px] items-center gap-2 rounded-full border border-[#DDE7F3] bg-white px-5 text-sm font-semibold text-[#344158] transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-[37px] items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Excluindo..." : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <AlertTriangle
          size={20}
          className="mt-0.5 shrink-0 text-red-500"
        />
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      </div>
    </BaseModal>
  );
}
