import React from "react";
import { BaseModal } from "@/components/Modal";
import type { CargoConvite } from "@/types";

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
  const [form, setForm] = React.useState({
    nome: "",
    email: "",
    cargo: "MEMBRO" as CargoConvite,
  });

  const handleSubmit = () => {
    if (!form.nome || !form.email) {
      return;
    }
    onSubmit(form.nome, form.email, form.cargo);
    setForm({ nome: "", email: "", cargo: "MEMBRO" });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar Membro"
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
            disabled={enviando}
            className="px-4 py-2 bg-[#4f35f5] text-white rounded-lg text-sm disabled:opacity-50"
          >
            {enviando ? "Enviando..." : "Adicionar"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm block mb-2 font-medium">Nome</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Nome do membro"
          />
        </div>

        <div>
          <label className="text-sm block mb-2 font-medium">Email</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="text-sm block mb-2 font-medium">Cargo</label>
          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
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
