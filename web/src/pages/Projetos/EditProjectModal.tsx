import React, { useState, useEffect } from "react";
import { BaseModal } from "@/components/Modal";
import { inputParaIso, isoParaInput } from "@/utils/dates";
import type { Projeto } from "@/types";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nome: string;
    descricao?: string;
    data_inicio?: string;
    data_fim?: string;
  }) => Promise<void>;
  project?: Projeto;
}

export function EditProjectModal({
  isOpen,
  onClose,
  onSubmit,
  project,
}: EditProjectModalProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      setNome(project.nome);
      setDescricao(project.descricao || "");
      setDataInicio(isoParaInput(project.data_inicio));
      setDataFim(isoParaInput(project.data_fim));
    }
  }, [project, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    try {
      await onSubmit({
        nome,
        descricao: descricao || undefined,
        data_inicio: inputParaIso(dataInicio),
        data_fim: inputParaIso(dataFim),
      });
      onClose();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Projeto"
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={carregando || !nome}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {carregando ? "Salvando..." : "Salvar"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Projeto *
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Ex: App Mobile"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição do projeto..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Início (opcional)
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Fim (opcional)
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </form>
    </BaseModal>
  );
}
