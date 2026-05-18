import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { BaseModal } from "@/components/Modal";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    titulo: string;
    descricao: string;
    prioridade: "BAIXA" | "MEDIA" | "ALTA";
    progresso: number;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
  task?: {
    id: string;
    titulo: string;
    descricao?: string;
    prioridade: "BAIXA" | "MEDIA" | "ALTA";
    progresso: number;
  };
}

export function EditTaskModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  task,
}: EditTaskModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState<"BAIXA" | "MEDIA" | "ALTA">(
    "MEDIA"
  );
  const [progresso, setProgresso] = useState(0);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (task) {
      setTitulo(task.titulo);
      setDescricao(task.descricao || "");
      setPrioridade(task.prioridade);
      setProgresso(task.progresso);
    }
  }, [task, isOpen]);

  async function handleSubmit() {
    if (!titulo.trim()) return;

    setCarregando(true);

    try {
      await onSubmit({
        titulo,
        descricao,
        prioridade,
        progresso,
      });
      onClose();
    } finally {
      setCarregando(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja deletar esta tarefa?")) return;

    setCarregando(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <BaseModal
      isOpen={isOpen && !!task}
      onClose={onClose}
      title="Editar Tarefa"
      size="md"
      footer={
        <>
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Deletar tarefa"
          >
            <Trash2 size={20} />
          </button>
          <div className="flex-1" />
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
            {carregando ? "Salvando..." : "Salvar"}
          </button>
        </>
      }
    >
      {task && (
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progresso: {progresso}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progresso}
              onChange={(e) => setProgresso(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}
    </BaseModal>
  );
}
