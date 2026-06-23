import React, { useState, useEffect, useRef } from "react";
import { X, Pencil, Trash2, Send, Paperclip, CheckSquare, Square, Calendar, Download, Upload, Loader2, FileText, Image, File, FileSpreadsheet } from "lucide-react";
import { createPortal } from "react-dom";
import type { Tarefa, Subtarefa, Tag } from "@/types";
import { useTarefasStore } from "@/store/useTarefasStore";
import { useToast } from "@/components/Toast";
import { ConfirmDeleteModal } from "@/components/Modal/ConfirmDeleteModal";
import { calcularProgressoTarefa, formatarDataBR } from "@/utils/kanban";
import { UserAvatar } from "@/components/ui/UserAvatar";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

type Aba = "detalhes" | "comentarios" | "anexos" | "historico";

const prioridadeClasses: Record<string, string> = {
  BAIXA: "bg-[#EEF1FF] text-[#5147F5]",
  MEDIA: "bg-[#FFF9E8] text-[#F5A400]",
  ALTA: "bg-[#FFF1F2] text-[#FF4F58]",
};
const prioridadeLabels: Record<string, string> = {
  BAIXA: "Sem urgência",
  MEDIA: "Importante",
  ALTA: "Alta Prioridade",
};

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (tarefa: Tarefa) => void;
  onDelete: () => Promise<void>;
  task?: Tarefa;
}

export function EditTaskModal({ isOpen, onClose, onEdit, onDelete, task }: EditTaskModalProps) {
  const [abaAtiva, setAbaAtiva] = useState<Aba>("detalhes");
  const [novoComentario, setNovoComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviandoAnexo, setEnviandoAnexo] = useState(false);
  const [deletandoAnexoId, setDeletandoAnexoId] = useState<string | null>(null);
  const [deletando, setDeletando] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const inputAnexoRef = useRef<HTMLInputElement>(null);

  const { atualizar, adicionarComentario, adicionarAnexo, deletarAnexo } = useTarefasStore();
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setAbaAtiva("detalhes");
      setNovoComentario("");
    }
  }, [isOpen, task?.id]);

  if (!isOpen || !task) return null;

  const progresso = calcularProgressoTarefa(task);
  const totalSubtarefas = task.subtarefas?.length ?? 0;
  const subtarefasConcluidas = task.subtarefas?.filter((s) => s.concluida).length ?? 0;
  const comentariosCount = task.comentarios?.length ?? task._count?.comentarios ?? 0;
  const anexosCount = task.anexos?.length ?? task._count?.anexos ?? 0;
  const historicosCount = task.historicos?.length ?? 0;

  const abas: { key: Aba; label: string; count?: number }[] = [
    { key: "detalhes", label: "Detalhes" },
    { key: "comentarios", label: "Comentários", count: comentariosCount },
    { key: "anexos", label: "Anexos", count: anexosCount },
    { key: "historico", label: "Histórico", count: historicosCount },
  ];

  async function toggleSubtarefa(sub: Subtarefa) {
    if (!task) return;
    const novasSubtarefas = (task.subtarefas ?? []).map((s) =>
      s.id === sub.id ? { ...s, concluida: !s.concluida } : s
    );
    try {
      await atualizar(task.id, {
        subtarefas: novasSubtarefas.map((s) => ({
          id: s.id,
          titulo: s.titulo,
          concluida: s.concluida,
          ordem: s.ordem,
        })),
      });
    } catch {
      toast.erro("Erro ao atualizar subtarefa");
    }
  }

  async function handleEnviarComentario() {
    if (!novoComentario.trim() || !task) return;
    setEnviando(true);
    try {
      await adicionarComentario(task.id, { texto: novoComentario.trim() });
      setNovoComentario("");
    } catch {
      toast.erro("Erro ao enviar comentário");
    } finally {
      setEnviando(false);
    }
  }

  async function handleUploadAnexo(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !task) return;

    setEnviandoAnexo(true);
    let sucessos = 0;
    let falhas = 0;

    for (const arquivo of files) {
      try {
        await adicionarAnexo(task.id, arquivo);
        sucessos++;
      } catch {
        falhas++;
      }
    }

    if (sucessos > 0) toast.sucesso(`${sucessos} arquivo(s) enviado(s)!`);
    if (falhas > 0) toast.erro(`${falhas} arquivo(s) falharam. Verifique o tamanho (máx. 20 MB).`);

    setEnviandoAnexo(false);
    if (inputAnexoRef.current) inputAnexoRef.current.value = "";
  }

  async function handleDeletarAnexo(anexoId: string) {
    if (!task) return;
    setDeletandoAnexoId(anexoId);
    try {
      await deletarAnexo(task.id, anexoId);
      toast.sucesso("Anexo removido.");
    } catch {
      toast.erro("Erro ao remover anexo.");
    } finally {
      setDeletandoAnexoId(null);
    }
  }

  async function handleDelete() {
    setConfirmDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    setConfirmDeleteOpen(false);
    setDeletando(true);
    try {
      await onDelete();
    } finally {
      setDeletando(false);
    }
  }

  function tempoRelativo(data: string): string {
    const diff = Date.now() - new Date(data).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "Agora";
    if (min < 60) return `Há ${min}min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `Há ${h}h`;
    const d = Math.floor(h / 24);
    return `Há ${d}d`;
  }

  const modal = createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="relative w-full max-w-[560px] max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#EEF2F8] px-6 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-[#202A3D] truncate">{task.titulo}</h2>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${prioridadeClasses[task.prioridade]}`}>
                {prioridadeLabels[task.prioridade]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#7E8DA6] transition hover:bg-slate-100 hover:text-[#202A3D]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas */}
        <div className="flex gap-1 border-b border-[#EEF2F8] px-6">
          {abas.map((aba) => (
            <button
              key={aba.key}
              type="button"
              onClick={() => setAbaAtiva(aba.key)}
              className={[
                "pb-3 pt-3 px-1 text-sm font-semibold border-b-2 transition whitespace-nowrap",
                abaAtiva === aba.key
                  ? "border-[#5B35F5] text-[#5B35F5]"
                  : "border-transparent text-[#7E8DA6] hover:text-[#202A3D]",
              ].join(" ")}
            >
              {aba.label}
              {aba.count !== undefined && aba.count > 0 && (
                <span className="ml-1 text-xs">({aba.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Conteúdo das abas */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ===== ABA DETALHES ===== */}
          {abaAtiva === "detalhes" && (
            <div className="space-y-4">
              {task.descricao && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#9EB2CC] mb-1">Descrição</p>
                  <p className="text-sm text-[#40506A] leading-relaxed">{task.descricao}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#9EB2CC] mb-1">Status</p>
                  <p className="text-sm font-medium text-[#202A3D]">{task.coluna?.nome ?? "Sem coluna"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#9EB2CC] mb-1">Progresso</p>
                  <p className="text-sm font-bold text-[#202A3D]">{progresso}%</p>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="h-2 rounded-full bg-[#EEF2F8] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#5B35F5] transition-all"
                  style={{ width: `${progresso}%` }}
                />
              </div>

              {/* Datas */}
              {(task.data_inicio || task.data_fim || task.prazo) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#9EB2CC] mb-1">Início</p>
                    <p className="text-sm text-[#202A3D] flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#9EB2CC]" />
                      <span>{formatarDataBR(task.data_inicio ?? task.prazo)}</span>
                    </p>
                  </div>
                  {task.data_fim && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#9EB2CC] mb-1">Fim</p>
                      <p className="text-sm text-[#202A3D] flex items-center gap-1.5">
                        <Calendar size={14} className="text-[#9EB2CC]" />
                        <span>{formatarDataBR(task.data_fim)}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Atribuídos */}
              {((task.membros?.length ?? 0) > 0 || task.responsavel) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#9EB2CC] mb-2">Atribuídos</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ...(task.responsavel ? [{ usuario: task.responsavel, isResponsavel: true }] : []),
                      ...(task.membros?.filter((m) => m.usuario.id !== task.responsavel?.id).map((m) => ({ usuario: m.usuario, isResponsavel: false })) ?? []),
                    ].map(({ usuario, isResponsavel }) => (
                      <div key={usuario.id} className="flex items-center gap-2">
                        <UserAvatar
                          nome={usuario.nome}
                          foto_url={(usuario as any).foto_url}
                          size={32}
                        />
                        <span className="text-sm text-[#40506A]">
                          {usuario.nome}
                          {isResponsavel && <span className="ml-1 text-[10px] text-[#9EB2CC]">(resp.)</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {(task.tags?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#9EB2CC] mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags!.map((tt) => (
                      <span
                        key={tt.tag.id}
                        className="rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                        style={{ backgroundColor: tt.tag.cor }}
                      >
                        {tt.tag.nome}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtarefas */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9EB2CC] mb-2">
                  Subtarefas {totalSubtarefas > 0 && `(${subtarefasConcluidas}/${totalSubtarefas})`}
                </p>
                {totalSubtarefas === 0 ? (
                  <p className="text-sm text-[#9EB2CC]">Nenhuma subtarefa</p>
                ) : (
                  <ul className="space-y-2">
                    {task.subtarefas!.map((sub) => (
                      <li
                        key={sub.id}
                        className="flex items-center gap-2.5 cursor-pointer group"
                        onClick={() => toggleSubtarefa(sub)}
                      >
                        {sub.concluida ? (
                          <CheckSquare size={18} className="shrink-0 text-[#5B35F5]" />
                        ) : (
                          <Square size={18} className="shrink-0 text-[#C9D5E6] group-hover:text-[#5B35F5]" />
                        )}
                        <span className={`text-sm ${sub.concluida ? "line-through text-[#9EB2CC]" : "text-[#202A3D]"}`}>
                          {sub.titulo}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* ===== ABA COMENTÁRIOS ===== */}
          {abaAtiva === "comentarios" && (
            <div className="flex flex-col gap-4">
              {(task.comentarios?.length ?? 0) === 0 ? (
                <p className="text-sm text-center text-[#9EB2CC] py-8">Nenhum comentário ainda</p>
              ) : (
                <div className="space-y-4">
                  {task.comentarios!.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <UserAvatar
                        nome={c.usuario?.nome ?? "Usuário"}
                        foto_url={(c.usuario as any)?.foto_url}
                        size={32}
                        className="shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-[#202A3D]">{c.usuario?.nome ?? "Usuário"}</span>
                          <span className="text-xs text-[#9EB2CC]">{tempoRelativo(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-[#40506A] leading-relaxed">{c.texto}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Input de comentário */}
              <div className="flex items-center gap-2 rounded-xl border border-[#DDE7F3] bg-[#F8FBFF] px-3 py-2">
                <input
                  type="text"
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEnviarComentario(); } }}
                  placeholder="Escreva um comentário..."
                  className="flex-1 bg-transparent text-sm text-[#202A3D] placeholder-[#9EB2CC] outline-none"
                />
                <button
                  type="button"
                  onClick={handleEnviarComentario}
                  disabled={!novoComentario.trim() || enviando}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#5B35F5] text-white transition hover:bg-[#4D2DE0] disabled:opacity-40"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ===== ABA ANEXOS ===== */}
          {abaAtiva === "anexos" && (
            <div className="space-y-3">
              {/* Área de upload */}
              <div className="border-b border-[#EEF2F8] pb-3">
                <input
                  ref={inputAnexoRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleUploadAnexo}
                  disabled={enviandoAnexo}
                />
                <button
                  type="button"
                  onClick={() => inputAnexoRef.current?.click()}
                  disabled={enviandoAnexo}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 py-3 text-sm font-semibold text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {enviandoAnexo ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload size={15} />
                      Adicionar arquivos
                    </>
                  )}
                </button>
                <p className="mt-1.5 text-center text-xs text-[#9EB2CC]">
                  Imagens, PDF, Word, Excel, CSV, ZIP — máx. 20 MB
                </p>
              </div>

              {/* Lista de anexos */}
              {(task.anexos?.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2F8]">
                    <Paperclip size={20} className="text-[#9EB2CC]" />
                  </div>
                  <p className="text-sm font-semibold text-[#40506A]">Nenhum anexo ainda</p>
                  <p className="mt-1 text-xs text-[#9EB2CC]">Clique em "Adicionar arquivos" para enviar</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {task.anexos!.map((a) => {
                    const fullUrl = a.url.startsWith("http") ? a.url : `${API_BASE}${a.url}`;
                    const isImage = a.tipo.startsWith("image/");
                    const isPdf = a.tipo === "application/pdf";

                    function iconeAnexo(tipo: string) {
                      if (tipo.startsWith("image/")) return <Image size={16} className="text-blue-500" />;
                      if (tipo === "application/pdf") return <FileText size={16} className="text-red-500" />;
                      if (tipo.includes("spreadsheet") || tipo.includes("excel") || tipo === "text/csv")
                        return <FileSpreadsheet size={16} className="text-emerald-500" />;
                      if (tipo.includes("word") || tipo === "text/plain")
                        return <FileText size={16} className="text-blue-400" />;
                      return <File size={16} className="text-[#9EB2CC]" />;
                    }

                    function tamanhoLegivel(bytes?: number | null) {
                      if (!bytes) return "";
                      if (bytes < 1024) return `${bytes} B`;
                      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
                      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
                    }

                    return (
                      <li
                        key={a.id}
                        className="group flex items-center gap-3 rounded-xl border border-[#DDE7F3] bg-white p-3 transition hover:border-[#5B35F5]/30 hover:bg-[#F8FBFF]"
                      >
                        {/* Ícone / preview */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF2F8]">
                          {isImage ? (
                            <img
                              src={fullUrl}
                              alt={a.nome}
                              className="h-9 w-9 rounded-lg object-cover"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          ) : (
                            iconeAnexo(a.tipo)
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#202A3D]">{a.nome}</p>
                          <p className="text-xs text-[#9EB2CC]">
                            {[tamanhoLegivel(a.tamanho), formatarDataBR(a.createdAt)]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>

                        {/* Ações */}
                        <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                          {/* Download */}
                          <button
                            type="button"
                            title="Baixar"
                            onClick={async () => {
                              try {
                                const res = await fetch(fullUrl);
                                if (!res.ok) throw new Error();
                                const blob = await res.blob();
                                const link = document.createElement("a");
                                link.href = URL.createObjectURL(blob);
                                link.download = a.nome;
                                link.click();
                                URL.revokeObjectURL(link.href);
                              } catch {
                                window.open(fullUrl, "_blank", "noopener,noreferrer");
                              }
                            }}
                            className="grid h-8 w-8 place-items-center rounded-lg text-[#9EB2CC] transition hover:bg-[#EEF1FF] hover:text-[#5B35F5]"
                          >
                            <Download size={14} />
                          </button>

                          {/* Ver em nova aba (imagens / PDFs) */}
                          {(isImage || isPdf) && (
                            <a
                              href={fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Visualizar"
                              className="grid h-8 w-8 place-items-center rounded-lg text-[#9EB2CC] transition hover:bg-[#EEF2F8] hover:text-[#202A3D]"
                            >
                              <Paperclip size={13} />
                            </a>
                          )}

                          {/* Deletar */}
                          <button
                            type="button"
                            title="Remover"
                            onClick={() => handleDeletarAnexo(a.id)}
                            disabled={deletandoAnexoId === a.id}
                            className="grid h-8 w-8 place-items-center rounded-lg text-[#9EB2CC] transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                          >
                            {deletandoAnexoId === a.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Rodapé com contagem */}
              {(task.anexos?.length ?? 0) > 0 && (
                <p className="text-right text-xs text-[#9EB2CC]">
                  {task.anexos!.length} arquivo{task.anexos!.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {/* ===== ABA HISTÓRICO ===== */}
          {abaAtiva === "historico" && (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9EB2CC]">Histórico de Alterações</p>
              {(task.historicos?.length ?? 0) === 0 ? (
                <p className="py-8 text-center text-sm text-[#9EB2CC]">Nenhuma alteração registrada</p>
              ) : (
                <div className="relative space-y-4 pl-5 before:absolute before:left-1.5 before:top-0 before:h-full before:w-0.5 before:bg-[#EEF2F8]">
                  {task.historicos!.map((h) => (
                    <div key={h.id} className="relative">
                      <div className="absolute -left-5 top-1 h-3 w-3 rounded-full border-2 border-white bg-[#C9D5E6]" />
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-[#202A3D] capitalize">
                            {h.campo_alterado === "tarefa" ? "Tarefa criada" : h.campo_alterado}
                          </p>
                          <p className="text-xs text-[#9EB2CC]">
                            por {h.usuario?.nome ?? "Sistema"}
                          </p>
                          {h.valor_novo && h.campo_alterado !== "tarefa" && (
                            <p className="mt-0.5 text-xs text-[#40506A]">→ {h.valor_novo}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-[#9EB2CC]">{formatarDataBR(h.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#EEF2F8] px-6 py-4">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="inline-flex h-[37px] items-center gap-2 rounded-full border border-[#DDE7F3] px-4 text-sm font-semibold text-[#40506A] transition hover:bg-slate-50"
          >
            <Pencil size={15} />
            Editar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deletando}
            className="inline-flex h-[37px] items-center gap-2 rounded-full bg-[#FF4F58] px-4 text-sm font-bold text-white shadow-[0_4px_12px_rgba(255,79,88,0.3)] transition hover:bg-[#e03040] disabled:opacity-50"
          >
            <Trash2 size={15} />
            {deletando ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      {modal}
      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir tarefa"
        description={`Tem certeza que deseja excluir a tarefa "${task.titulo}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir tarefa"
        loading={deletando}
      />
    </>
  );
}
