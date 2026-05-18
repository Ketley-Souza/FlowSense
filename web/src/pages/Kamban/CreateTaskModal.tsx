import React, { useState } from "react";
import { BaseModal } from "@/components/Modal";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    titulo: string;
    descricao: string;
    prioridade: "BAIXA" | "MEDIA" | "ALTA";
    id_coluna?: string;
  }) => Promise<void>;
  colunas?: Array<{ id: string; nome: string }>;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  colunas = [],
}: CreateTaskModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState<"BAIXA" | "MEDIA" | "ALTA">(
    "MEDIA"
  );
  const [coluna, setColuna] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit() {
    if (!titulo.trim()) return;

    setCarregando(true);

    try {
      await onSubmit({
        titulo,
        descricao,
        prioridade,
        id_coluna: coluna || undefined,
      });

      setTitulo("");
      setDescricao("");
      setPrioridade("MEDIA");
      setColuna("");
      onClose();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Nova Tarefa"
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={carregando || !titulo.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {carregando ? "Criando..." : "Criar"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Implementar autenticação"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descrição da tarefa..."
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prioridade
          </label>
          <select
            value={prioridade}
            onChange={(e) =>
              setPrioridade(e.target.value as "BAIXA" | "MEDIA" | "ALTA")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
          </select>
        </div>

        {colunas.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coluna
            </label>
            <select
              value={coluna}
              onChange={(e) => setColuna(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecionar coluna...</option>
              {colunas.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
