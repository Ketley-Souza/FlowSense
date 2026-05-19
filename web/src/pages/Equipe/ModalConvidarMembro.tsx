import { useState, useEffect } from "react";
import { BaseModal } from "@/components/Modal";
import type { CargoConvite } from "@/types";

const INPUT_CLS =
  "w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200/70";
const LABEL_CLS = "block text-sm font-medium text-slate-700 mb-1.5";
const BTN_CANCEL =
  "inline-flex h-9 items-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50";
const BTN_PRIMARY =
  "inline-flex h-9 items-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50";

interface ModalConvidarMembroProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nome: string, email: string, cargo: CargoConvite) => void;
  enviando?: boolean;
}

export function ModalConvidarMembro({
  isOpen,
  onClose,
  onSubmit,
  enviando = false,
}: ModalConvidarMembroProps) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    cargo: "MEMBRO" as CargoConvite,
  });

  // Limpa o formulário ao fechar
  useEffect(() => {
    if (!isOpen) setForm({ nome: "", email: "", cargo: "MEMBRO" });
  }, [isOpen]);

  const canSubmit = form.nome.trim().length > 0 && form.email.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(form.nome.trim(), form.email.trim(), form.cargo);
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Convidar membro"
      size="sm"
      footer={
        <>
          <button onClick={onClose} className={BTN_CANCEL}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={enviando || !canSubmit}
            className={BTN_PRIMARY}
          >
            {enviando ? "Enviando…" : "Enviar convite"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={LABEL_CLS}>Nome</label>
          <input
            id="invite-nome"
            className={INPUT_CLS}
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Nome do membro"
            autoComplete="off"
          />
        </div>

        <div>
          <label className={LABEL_CLS}>E-mail</label>
          <input
            id="invite-email"
            className={INPUT_CLS}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@exemplo.com"
            autoComplete="off"
          />
        </div>

        <div>
          <label className={LABEL_CLS}>Cargo</label>
          <select
            id="invite-cargo"
            className={INPUT_CLS}
            value={form.cargo}
            onChange={(e) => setForm({ ...form, cargo: e.target.value as CargoConvite })}
          >
            <option value="MEMBRO">Membro</option>
            <option value="GERENTE">Gerente</option>
          </select>
        </div>
      </div>
    </BaseModal>
  );
}
