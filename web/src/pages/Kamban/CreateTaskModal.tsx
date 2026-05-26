import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, ChevronDown, Tag as TagIcon } from "lucide-react";
import { createPortal } from "react-dom";
import type { ProjetoMembro, Tag } from "@/types";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface SubtarefaLocal {
  titulo: string;
  concluida: boolean;
}

interface TagLocal {
  id?: string;
  nome: string;
  cor: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    titulo: string;
    descricao: string;
    prioridade: "BAIXA" | "MEDIA" | "ALTA";
    data_inicio?: string;
    data_fim?: string;
    id_coluna?: string;
    id_responsavel?: string;
    id_membros?: string[];
    subtarefas?: Array<{ titulo: string; concluida: boolean }>;
    tags?: Array<{ id?: string; nome: string; cor?: string }>;
  }) => Promise<void>;
  colunas?: Array<{ id: string; nome: string }>;
  membros?: ProjetoMembro[];
  tagsExistentes?: Tag[];
  colunaInicialId?: string;
}

const TAG_COLORS = [
  "#5147F5", "#00B87A", "#FF4F58", "#F59E0B", "#0EA5E9",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#6366F1",
];

const PRIORIDADES = [
  { value: "BAIXA" as const, label: "Sem urgência", color: "#5147F5", bg: "#EEF1FF" },
  { value: "MEDIA" as const, label: "Importante", color: "#F5A400", bg: "#FFF9E8" },
  { value: "ALTA" as const, label: "Alta Prioridade", color: "#FF4F58", bg: "#FFF1F2" },
];

export function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  colunas = [],
  membros = [],
  tagsExistentes = [],
  colunaInicialId,
}: CreateTaskModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState<"BAIXA" | "MEDIA" | "ALTA">("MEDIA");
  const [coluna, setColuna] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [membrosSelecionados, setMembrosSelecionados] = useState<string[]>([]);
  const [subtarefas, setSubtarefas] = useState<SubtarefaLocal[]>([]);
  const [novaSubtarefa, setNovaSubtarefa] = useState("");
  const [tagsSelecionadas, setTagsSelecionadas] = useState<TagLocal[]>([]);
  const [novaTagNome, setNovaTagNome] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Reset ao abrir
  useEffect(() => {
    if (isOpen) {
      setTitulo("");
      setDescricao("");
      setPrioridade("MEDIA");
      setColuna(colunaInicialId ?? colunas[0]?.id ?? "");
      setDataInicio("");
      setDataFim("");
      setMembrosSelecionados([]);
      setSubtarefas([]);
      setNovaSubtarefa("");
      setTagsSelecionadas([]);
      setNovaTagNome("");
      setShowTagInput(false);
    }
  }, [isOpen, colunaInicialId, colunas]);

  useEffect(() => {
    if (showTagInput) tagInputRef.current?.focus();
  }, [showTagInput]);

  function toggleMembro(id: string) {
    setMembrosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  function adicionarSubtarefa() {
    const t = novaSubtarefa.trim();
    if (!t) return;
    setSubtarefas((prev) => [...prev, { titulo: t, concluida: false }]);
    setNovaSubtarefa("");
  }

  function removerSubtarefa(idx: number) {
    setSubtarefas((prev) => prev.filter((_, i) => i !== idx));
  }

  function adicionarTag() {
    const nome = novaTagNome.trim();
    if (!nome) return;

    // Verificar se já existe tag com mesmo nome
    const jaExiste = tagsSelecionadas.some(
      (t) => t.nome.toLowerCase() === nome.toLowerCase()
    );
    if (jaExiste) {
      setNovaTagNome("");
      setShowTagInput(false);
      return;
    }

    // Verificar se é uma tag existente do projeto
    const tagExistente = tagsExistentes.find(
      (t) => t.nome.toLowerCase() === nome.toLowerCase()
    );

    if (tagExistente) {
      setTagsSelecionadas((prev) => [
        ...prev,
        { id: tagExistente.id, nome: tagExistente.nome, cor: tagExistente.cor },
      ]);
    } else {
      const cor = TAG_COLORS[tagsSelecionadas.length % TAG_COLORS.length];
      setTagsSelecionadas((prev) => [...prev, { nome, cor }]);
    }

    setNovaTagNome("");
    setShowTagInput(false);
  }

  function removerTag(idx: number) {
    setTagsSelecionadas((prev) => prev.filter((_, i) => i !== idx));
  }

  function selecionarTagExistente(tag: Tag) {
    const jaExiste = tagsSelecionadas.some((t) => t.id === tag.id || t.nome === tag.nome);
    if (jaExiste) return;
    setTagsSelecionadas((prev) => [
      ...prev,
      { id: tag.id, nome: tag.nome, cor: tag.cor },
    ]);
  }

  async function handleSubmit() {
    if (!titulo.trim()) return;
    setCarregando(true);
    try {
      await onSubmit({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        prioridade,
        data_inicio: dataInicio ? new Date(dataInicio).toISOString() : undefined,
        data_fim: dataFim ? new Date(dataFim).toISOString() : undefined,
        id_coluna: coluna || undefined,
        id_responsavel: membrosSelecionados[0] || undefined,
        id_membros: membrosSelecionados.length > 0 ? membrosSelecionados : undefined,
        subtarefas: subtarefas.length > 0 ? subtarefas : undefined,
        tags: tagsSelecionadas.length > 0
          ? tagsSelecionadas.map((t) => ({ id: t.id, nome: t.nome, cor: t.cor }))
          : undefined,
      });
    } finally {
      setCarregando(false);
    }
  }

  if (!isOpen) return null;

  const prioridadeAtual = PRIORIDADES.find((p) => p.value === prioridade)!;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EEF2F8] bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-[#202A3D]">Criar Tarefa</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-[#7E8DA6] transition hover:bg-slate-100 hover:text-[#202A3D]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Título */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#202A3D]">
              Título <span className="text-[#FF4F58]">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título da tarefa"
              className="w-full rounded-xl border border-[#DDE7F3] bg-[#F8FBFF] px-3.5 py-2.5 text-sm text-[#202A3D] placeholder-[#9EB2CC] outline-none transition focus:border-[#5B35F5] focus:bg-white focus:ring-2 focus:ring-[#5B35F5]/10"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#202A3D]">
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição da tarefa"
              rows={3}
              className="w-full resize-none rounded-xl border border-[#DDE7F3] bg-[#F8FBFF] px-3.5 py-2.5 text-sm text-[#202A3D] placeholder-[#9EB2CC] outline-none transition focus:border-[#5B35F5] focus:bg-white focus:ring-2 focus:ring-[#5B35F5]/10"
            />
          </div>

          {/* Prazo (data range) */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#202A3D]">
              Prazo
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="flex-1 rounded-xl border border-[#DDE7F3] bg-[#F8FBFF] px-3 py-2.5 text-sm text-[#202A3D] outline-none transition focus:border-[#5B35F5] focus:ring-2 focus:ring-[#5B35F5]/10"
              />
              <span className="text-sm text-[#9EB2CC] font-medium">→</span>
              <input
                type="date"
                value={dataFim}
                min={dataInicio}
                onChange={(e) => setDataFim(e.target.value)}
                className="flex-1 rounded-xl border border-[#DDE7F3] bg-[#F8FBFF] px-3 py-2.5 text-sm text-[#202A3D] outline-none transition focus:border-[#5B35F5] focus:ring-2 focus:ring-[#5B35F5]/10"
              />
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#202A3D]">
              Prioridade
            </label>
            <div className="relative">
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as "BAIXA" | "MEDIA" | "ALTA")}
                className="w-full appearance-none rounded-xl border border-[#DDE7F3] bg-[#F8FBFF] px-3.5 py-2.5 text-sm font-semibold outline-none transition focus:border-[#5B35F5] focus:ring-2 focus:ring-[#5B35F5]/10"
                style={{ color: prioridadeAtual.color }}
              >
                {PRIORIDADES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7E8DA6]"
              />
            </div>
          </div>

          {/* Coluna */}
          {colunas.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#202A3D]">
                Coluna
              </label>
              <div className="relative">
                <select
                  value={coluna}
                  onChange={(e) => setColuna(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#DDE7F3] bg-[#F8FBFF] px-3.5 py-2.5 text-sm text-[#202A3D] outline-none transition focus:border-[#5B35F5] focus:ring-2 focus:ring-[#5B35F5]/10"
                >
                  <option value="">Selecionar coluna...</option>
                  {colunas.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.nome}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7E8DA6]"
                />
              </div>
            </div>
          )}

          {/* Atribuídos */}
          {membros.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#202A3D]">
                Atribuídos
              </label>
              <div className="flex flex-wrap gap-2">
                {membros.map((m) => {
                  const selecionado = membrosSelecionados.includes(m.id_usuario);
                  return (
                    <button
                      key={m.id_usuario}
                      type="button"
                      onClick={() => toggleMembro(m.id_usuario)}
                      className={[
                        "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition",
                        selecionado
                          ? "border-[#5B35F5] bg-[#EEF1FF] text-[#5B35F5]"
                          : "border-[#DDE7F3] bg-white text-[#40506A] hover:border-[#5B35F5]/40",
                      ].join(" ")}
                    >
                      <UserAvatar
                        nome={m.usuario.nome}
                        foto_url={(m.usuario as any).foto_url}
                        size={24}
                      />
                      <span className="max-w-[120px] truncate">{m.usuario.nome}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#202A3D]">
              Tags
            </label>

            {/* Tags existentes do projeto para seleção rápida */}
            {tagsExistentes.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {tagsExistentes.map((tag) => {
                  const selecionada = tagsSelecionadas.some((t) => t.id === tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => selecionarTagExistente(tag)}
                      className={[
                        "rounded-full px-2.5 py-1 text-[11px] font-bold transition",
                        selecionada ? "opacity-40" : "opacity-100 hover:opacity-80",
                      ].join(" ")}
                      style={{ backgroundColor: tag.cor + "22", color: tag.cor, border: `1px solid ${tag.cor}` }}
                    >
                      {tag.nome}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#DDE7F3] bg-[#F8FBFF] px-3 py-2 min-h-[42px]">
              {tagsSelecionadas.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                  style={{ backgroundColor: tag.cor }}
                >
                  <TagIcon size={10} />
                  {tag.nome}
                  <button
                    type="button"
                    onClick={() => removerTag(idx)}
                    className="ml-0.5 opacity-70 hover:opacity-100"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}

              {showTagInput ? (
                <input
                  ref={tagInputRef}
                  type="text"
                  value={novaTagNome}
                  onChange={(e) => setNovaTagNome(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); adicionarTag(); }
                    if (e.key === "Escape") { setShowTagInput(false); setNovaTagNome(""); }
                  }}
                  onBlur={adicionarTag}
                  placeholder="Nome da tag..."
                  className="min-w-[120px] flex-1 bg-transparent text-sm text-[#202A3D] placeholder-[#9EB2CC] outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTagInput(true)}
                  className="grid h-6 w-6 place-items-center rounded-full bg-[#5B35F5] text-white transition hover:bg-[#4D2DE0]"
                >
                  <Plus size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Subtarefas */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#202A3D]">
              Subtarefas
            </label>

            {subtarefas.length > 0 && (
              <ul className="mb-2 space-y-1.5">
                {subtarefas.map((sub, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-[#DDE7F3] bg-white px-3 py-2"
                  >
                    <span className="h-4 w-4 shrink-0 rounded border border-[#C9D5E6]" />
                    <span className="flex-1 text-sm text-[#202A3D]">{sub.titulo}</span>
                    <button
                      type="button"
                      onClick={() => removerSubtarefa(idx)}
                      className="text-[#9EB2CC] transition hover:text-[#FF4F58]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={novaSubtarefa}
                onChange={(e) => setNovaSubtarefa(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); adicionarSubtarefa(); }
                }}
                placeholder="Adicionar subtarefa..."
                className="flex-1 rounded-xl border border-[#DDE7F3] bg-[#F8FBFF] px-3.5 py-2.5 text-sm text-[#202A3D] placeholder-[#9EB2CC] outline-none transition focus:border-[#5B35F5] focus:ring-2 focus:ring-[#5B35F5]/10"
              />
              <button
                type="button"
                onClick={adicionarSubtarefa}
                disabled={!novaSubtarefa.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#5B35F5] text-white transition hover:bg-[#4D2DE0] disabled:opacity-40"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[#EEF2F8] bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-[#DDE7F3] px-5 text-sm font-semibold text-[#40506A] transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={carregando || !titulo.trim()}
            className="h-10 rounded-xl bg-[#5B35F5] px-6 text-sm font-bold text-white shadow-[0_4px_12px_rgba(91,53,245,0.35)] transition hover:bg-[#4D2DE0] disabled:opacity-50"
          >
            {carregando ? "Criando..." : "Criar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
