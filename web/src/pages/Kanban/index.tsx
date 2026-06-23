import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DndContext, DragOverlay, closestCorners, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, type DragStartEvent, type DragOverEvent, type DragEndEvent,} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { CreateTaskModal } from "./CreateTaskModal";
import { EditTaskModal } from "./EditTaskModal";
import { CreateColumnModal } from "./CreateColumnModal";

import { ConfirmDeleteModal } from "@/components/Modal/ConfirmDeleteModal";
import { ToastContainer, useToast } from "@/components/Toast";
import { KanbanHeader } from "@/components/kanban/KanbanHeader";
import { TaskCard } from "@/components/kanban/TaskCard";
import { DroppableColumn } from "@/components/kanban/DroppableColumn";
import { SortableTaskCard } from "@/components/kanban/SortableTaskCard";
import type { ViewMode } from "@/components/kanban/BoardViewTabs";

import { buildBoardColumns, type BoardColumn } from "@/utils/kanban";
import { moveTarefaBetweenColumns, findColumnIdByTask, type DragData } from "@/utils/dnd";
import { useProjetosStore } from "@/store/useProjetosStore";
import { useTarefasStore } from "@/store/useTarefasStore";
import type { CriarTarefaPayload, Tarefa } from "@/types";

// ── Constantes ────────────────────────────────────────────────────────────────
type Prioridade = "" | "BAIXA" | "MEDIA" | "ALTA";

const PRIORIDADE_LABEL: Record<string, string> = {
  BAIXA: "Sem urgência", MEDIA: "Importante", ALTA: "Alta Prioridade",
};
const PRIORIDADE_COR: Record<string, string> = {
  ALTA: "bg-[#FFF1F2] text-[#FF4F58]",
  MEDIA: "bg-[#FFF9E8] text-[#F5A400]",
  BAIXA: "bg-[#EEF1FF] text-[#5147F5]",
};

// ── Estado de modal consolidado ───────────────────────────────────────────────
type Modal =
  | { kind: "none" }
  | { kind: "createTask"; colunaId?: string }
  | { kind: "editTask";   tarefaId: string }
  | { kind: "editForm";   tarefaId: string }
  | { kind: "createColumn" }
  | { kind: "deleteColumn"; id: string; nome: string; loading: boolean };

// ── FilterPanel ───────────────────────────────────────────────────────────────
type FilterPanelProps = {
  prioridade: Prioridade;
  busca: string;
  onChange: (patch: Partial<{ prioridade: Prioridade; busca: string }>) => void;
};

function FilterPanel({ prioridade, busca, onChange }: FilterPanelProps) {
  return (
    <div className="border-b border-[#DDE7F3] bg-white px-6 py-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-xs font-semibold text-[#9EB2CC] uppercase tracking-wide">Buscar</label>
          <input
            type="text"
            value={busca}
            onChange={(e) => onChange({ busca: e.target.value })}
            placeholder="Título ou descrição..."
            className="w-full rounded-xl border border-[#DDE7F3] bg-[#F8FBFF] px-3 py-2 text-sm text-[#202A3D] placeholder-[#9EB2CC] outline-none focus:border-[#5B35F5] focus:ring-2 focus:ring-[#5B35F5]/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-[#9EB2CC] uppercase tracking-wide">Prioridade</label>
          <div className="flex gap-2">
            {(["", "BAIXA", "MEDIA", "ALTA"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChange({ prioridade: p })}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-bold border transition",
                  prioridade === p
                    ? p === "ALTA" ? "bg-[#FF4F58] border-[#FF4F58] text-white"
                      : p === "MEDIA" ? "bg-[#F5A400] border-[#F5A400] text-white"
                      : p === "BAIXA" ? "bg-[#5147F5] border-[#5147F5] text-white"
                      : "bg-[#202A3D] border-[#202A3D] text-white"
                    : "border-[#DDE7F3] text-[#40506A] hover:border-[#5B35F5]/40",
                ].join(" ")}
              >
                {p === "" ? "Todas" : PRIORIDADE_LABEL[p]}
              </button>
            ))}
          </div>
        </div>

        {(prioridade || busca.trim()) && (
          <button
            type="button"
            onClick={() => onChange({ prioridade: "", busca: "" })}
            className="text-sm font-semibold text-[#FF4F58] hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}

// ── Página Kanban ─────────────────────────────────────────────────────────────
export default function Kanban() {
  const { tarefas, carregando, erro, listar, listarPorProjeto, criar, deletar } = useTarefasStore();
  const { projetoAtual, criarColuna, deletarColuna } = useProjetosStore();
  const toast = useToast();

  const [view, setView] = useState<ViewMode>("kanban");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [filtros, setFiltros] = useState<{ prioridade: Prioridade; busca: string }>({ prioridade: "", busca: "" });
  const [modal, setModal] = useState<Modal>({ kind: "none" });

  const close = () => setModal({ kind: "none" });

  const tarefaSelecionadaId =
    modal.kind === "editTask" || modal.kind === "editForm" ? modal.tarefaId : null;
  const tarefaSelecionada = useMemo(
    () => tarefas.find((t) => t.id === tarefaSelecionadaId) ?? null,
    [tarefas, tarefaSelecionadaId]
  );

  // ── Scroll ────────────────────────────────────────────────────────────────
  const boardRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = boardRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
  }, []);

  useEffect(() => {
    const id = setTimeout(checkScroll, 100);
    return () => clearTimeout(id);
  }, [projetoAtual?.colunas?.length]);

  // ── DnD ───────────────────────────────────────────────────────────────────
  const [activeTask, setActiveTask] = useState<Tarefa | null>(null);
  const [optimisticColumns, setOptimisticColumns] = useState<BoardColumn[] | null>(null);
  const optimisticRef = useRef<BoardColumn[] | null>(null);
  const originColumnIdRef = useRef<string | undefined>(undefined);
  const toastErroRef = useRef(toast.erro);
  toastErroRef.current = toast.erro;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Dados ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    projetoAtual?.id ? listarPorProjeto(projetoAtual.id) : listar();
  }, [projetoAtual?.id, listar, listarPorProjeto]);

  const tarefasDoProjeto = useMemo(() => {
    let lista = projetoAtual ? tarefas.filter((t) => t.id_projeto === projetoAtual.id) : tarefas;
    if (filtros.busca.trim()) {
      const termo = filtros.busca.toLowerCase();
      lista = lista.filter((t) =>
        t.titulo.toLowerCase().includes(termo) || t.descricao?.toLowerCase().includes(termo)
      );
    }
    if (filtros.prioridade) lista = lista.filter((t) => t.prioridade === filtros.prioridade);
    return lista;
  }, [projetoAtual, tarefas, filtros]);

  const boardColumns = useMemo(
    () => buildBoardColumns(tarefasDoProjeto, projetoAtual?.colunas ?? []),
    [projetoAtual?.colunas, tarefasDoProjeto]
  );
  const displayColumns = activeTask && optimisticColumns ? optimisticColumns : boardColumns;

  const colunasParaModal = useMemo(
    () => (projetoAtual?.colunas ?? []).map((c) => ({ id: c.id, nome: c.nome })),
    [projetoAtual?.colunas]
  );

  // ── Handlers de tarefa/coluna ─────────────────────────────────────────────
  async function handleCriarTarefa(payload: Omit<CriarTarefaPayload, "id_projeto">) {
    if (!projetoAtual?.id) return toast.erro("Selecione um projeto antes de criar tarefas.");
    try {
      await criar({ ...payload, id_projeto: projetoAtual.id });
      close();
      toast.sucesso("Tarefa criada com sucesso!");
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao criar tarefa");
    }
  }

  async function handleDeletarTarefa() {
    if (!tarefaSelecionadaId) return;
    try {
      await deletar(tarefaSelecionadaId);
      close();
      toast.sucesso("Tarefa excluída com sucesso!");
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao excluir tarefa");
    }
  }

  async function handleEditarTarefa(payload: any) {
    if (!tarefaSelecionadaId) return;
    try {
      await useTarefasStore.getState().atualizar(tarefaSelecionadaId, payload);
      close();
      toast.sucesso("Tarefa atualizada com sucesso!");
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao atualizar tarefa");
    }
  }

  async function handleCriarColuna(nome: string) {
    if (!projetoAtual?.id) return toast.erro("Selecione um projeto para criar colunas.");
    try {
      await criarColuna(projetoAtual.id, nome);
      toast.sucesso(`Coluna "${nome}" criada!`);
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao criar coluna");
    }
  }

  async function handleConfirmarDeletarColuna() {
    if (modal.kind !== "deleteColumn") return;
    setModal({ ...modal, loading: true });
    try {
      await deletarColuna(projetoAtual!.id, modal.id);
      toast.sucesso(`Coluna "${modal.nome}" excluída.`);
      close();
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao excluir coluna");
      setModal({ ...modal, loading: false });
    }
  }

  // ── Handlers DnD ──────────────────────────────────────────────────────────
  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as DragData | undefined;
    if (data?.type !== "TASK") return;
    let found: Tarefa | undefined;
    for (const col of boardColumns) {
      found = col.tarefas.find((t) => t.id === data.tarefaId);
      if (found) break;
    }
    originColumnIdRef.current = findColumnIdByTask(boardColumns, data.tarefaId);
    optimisticRef.current = boardColumns;
    setOptimisticColumns(boardColumns);
    setActiveTask(found ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const current = optimisticRef.current;
    if (!over || !current) return;
    const activeData = active.data.current as DragData | undefined;
    if (activeData?.type !== "TASK") return;

    const tarefaId = activeData.tarefaId;
    const fromColumnId = findColumnIdByTask(current, tarefaId);
    if (!fromColumnId) return;

    const overData = over.data.current as DragData | undefined;
    let toColumnId: string;
    let overTaskId: string | null = null;

    if (overData?.type === "TASK") {
      const overColId = findColumnIdByTask(current, over.id as string);
      if (!overColId) return;
      toColumnId = overColId;
      overTaskId = over.id as string;
    } else {
      toColumnId = over.id as string;
    }

    if (fromColumnId === toColumnId && overTaskId === null) return;
    const next = moveTarefaBetweenColumns(current, tarefaId, fromColumnId, toColumnId, overTaskId);
    optimisticRef.current = next;
    setOptimisticColumns(next);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const lastOptimistic = optimisticRef.current;
    const fromColumnId = originColumnIdRef.current;

    optimisticRef.current = null;
    originColumnIdRef.current = undefined;
    setActiveTask(null);
    setOptimisticColumns(null);

    if (!over || !lastOptimistic) return;
    const activeData = active.data.current as DragData | undefined;
    if (activeData?.type !== "TASK") return;

    const tarefaId = activeData.tarefaId;
    const toColumnId = findColumnIdByTask(lastOptimistic, tarefaId);
    if (!toColumnId || fromColumnId === toColumnId) return;

    const toFormColumnId = lastOptimistic.find((c) => c.id === toColumnId)?.formColumnId ?? null;
    useTarefasStore.getState().moverTarefa(tarefaId, toFormColumnId);

    try {
      await useTarefasStore.getState().atualizar(tarefaId, { id_coluna: toFormColumnId });
    } catch {
      const originFormId = boardColumns.find((c) => c.id === fromColumnId)?.formColumnId ?? null;
      useTarefasStore.getState().moverTarefa(tarefaId, originFormId);
      toastErroRef.current("Erro ao mover tarefa. A posição foi revertida.");
    }
  }

  function handleDragCancel() {
    optimisticRef.current = null;
    originColumnIdRef.current = undefined;
    setActiveTask(null);
    setOptimisticColumns(null);
  }

  // ── Views ─────────────────────────────────────────────────────────────────
  function renderKanban() {
    return (
      <div className="relative">
        {canScrollLeft && (
          <button type="button" onClick={() => boardRef.current?.scrollBy({ left: -420, behavior: "smooth" })} aria-label="Colunas anteriores"
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-2 grid h-10 w-10 place-items-center rounded-full border border-[#DDE7F3] bg-white shadow-md text-[#42516A] transition hover:border-[#5B35F5] hover:text-[#5B35F5]">
            <ChevronLeft size={20} />
          </button>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCorners}
          onDragStart={handleDragStart} onDragOver={handleDragOver}
          onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
          <div ref={boardRef} className="flex gap-5 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: "none" }}>
            {displayColumns.map((column) => (
              <DroppableColumn
                key={column.id}
                column={column}
                tarefas={column.tarefas}
                onAddTask={() => setModal({ kind: "createTask", colunaId: column.formColumnId })}
                onSelectTask={(t) => setModal({ kind: "editTask", tarefaId: t.id })}
                onDeleteColumn={column.formColumnId
                  ? () => setModal({ kind: "deleteColumn", id: column.formColumnId!, nome: column.title, loading: false })
                  : undefined}
              >
                {column.tarefas.map((tarefa) => (
                  <SortableTaskCard
                    key={tarefa.id}
                    tarefa={tarefa}
                    progressColor={column.progressColor}
                    onClick={() => setModal({ kind: "editTask", tarefaId: tarefa.id })}
                  />
                ))}
              </DroppableColumn>
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
            {activeTask && (
              <div style={{ opacity: 0.92, transform: "rotate(1.5deg)", boxShadow: "0 20px 40px rgba(31,42,61,0.18)", borderRadius: "20px" }}>
                <TaskCard tarefa={activeTask} progressColor="#5B35F5" onClick={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {canScrollRight && (
          <button type="button" onClick={() => boardRef.current?.scrollBy({ left: 420, behavior: "smooth" })} aria-label="Próximas colunas"
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 grid h-10 w-10 place-items-center rounded-full border border-[#DDE7F3] bg-white shadow-md text-[#42516A] transition hover:border-[#5B35F5] hover:text-[#5B35F5]">
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    );
  }

  function renderLista() {
    const progresso = (t: Tarefa) => t.subtarefas?.length
      ? Math.round((t.subtarefas.filter((s) => s.concluida).length / t.subtarefas.length) * 100)
      : t.progresso;

    return (
      <div className="w-full overflow-x-auto rounded-2xl border border-[#DDE7F3] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EEF2F8] bg-[#F8FBFF]">
              {["Tarefa", "Coluna", "Prioridade", "Progresso", "Prazo"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#9EB2CC]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tarefasDoProjeto.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-sm text-[#9EB2CC]">Nenhuma tarefa encontrada</td></tr>
            ) : tarefasDoProjeto.map((t) => {
              const prog = progresso(t);
              const prazo = t.data_fim ?? t.prazo;
              return (
                <tr key={t.id} onClick={() => setModal({ kind: "editTask", tarefaId: t.id })}
                  className="cursor-pointer border-b border-[#EEF2F8] transition hover:bg-[#F8FBFF]">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-[#202A3D]">{t.titulo}</p>
                    {t.descricao && <p className="text-xs text-[#9EB2CC] truncate max-w-[260px]">{t.descricao}</p>}
                  </td>
                  <td className="px-4 py-3 text-[#40506A]">{t.coluna?.nome ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${PRIORIDADE_COR[t.prioridade] ?? ""}`}>
                      {PRIORIDADE_LABEL[t.prioridade]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-[#EEF2F8]">
                        <div className="h-full rounded-full bg-[#5B35F5]" style={{ width: `${prog}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-[#202A3D]">{prog}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#9EB2CC]">
                    {prazo ? new Date(prazo).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function renderGrade() {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {tarefasDoProjeto.length === 0
          ? <div className="col-span-full py-16 text-center text-sm text-[#9EB2CC]">Nenhuma tarefa encontrada</div>
          : tarefasDoProjeto.map((t) => (
              <TaskCard key={t.id} tarefa={t} progressColor="#5B35F5"
                onClick={() => setModal({ kind: "editTask", tarefaId: t.id })} />
            ))
        }
      </div>
    );
  }

  const membros = projetoAtual?.membros ?? [];
  const tags = projetoAtual?.tags ?? [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 bg-[#F4F7FB] font-sans text-[#202A3D]">
      <KanbanHeader
        projectName={projetoAtual?.nome ?? "Selecione um Projeto"}
        onCreateColumn={() => setModal({ kind: "createColumn" })}
        onCreateTask={() => setModal({ kind: "createTask" })}
        view={view}
        onChangeView={setView}
        filtrosAbertos={filtrosAbertos}
        temFiltroAtivo={!!(filtros.prioridade || filtros.busca.trim())}
        onToggleFiltros={() => setFiltrosAbertos((v) => !v)}
      />

      {filtrosAbertos && (
        <FilterPanel
          prioridade={filtros.prioridade}
          busca={filtros.busca}
          onChange={(patch) => setFiltros((f) => ({ ...f, ...patch }))}
        />
      )}

      {erro && (
        <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erro}
        </div>
      )}

      {carregando && tarefas.length === 0 ? (
        <main className="grid min-h-[420px] place-items-center flex-1">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5B35F5] border-t-transparent" />
            <p className="text-sm font-medium text-[#7E8DA6]">Carregando tarefas...</p>
          </div>
        </main>
      ) : (
        <main className="flex-1 overflow-x-auto px-6 py-8">
          {view === "kanban" && renderKanban()}
          {view === "lista"  && renderLista()}
          {view === "grade"  && renderGrade()}
        </main>
      )}

      {/* ── Modais ─────────────────────────────────────────────────────────── */}
      <CreateTaskModal
        isOpen={modal.kind === "createTask"}
        onClose={close}
        onSubmit={handleCriarTarefa}
        colunas={colunasParaModal}
        membros={membros}
        tagsExistentes={tags}
        colunaInicialId={modal.kind === "createTask" ? modal.colunaId : undefined}
      />

      <EditTaskModal
        isOpen={modal.kind === "editTask"}
        onClose={close}
        onEdit={() => modal.kind === "editTask" && setModal({ kind: "editForm", tarefaId: modal.tarefaId })}
        onDelete={handleDeletarTarefa}
        task={tarefaSelecionada ?? undefined}
      />

      <CreateTaskModal
        isOpen={modal.kind === "editForm"}
        onClose={close}
        onSubmit={handleEditarTarefa}
        colunas={colunasParaModal}
        membros={membros}
        tagsExistentes={tags}
        task={tarefaSelecionada ?? undefined}
      />

      <CreateColumnModal
        isOpen={modal.kind === "createColumn"}
        onClose={close}
        onSubmit={handleCriarColuna}
      />

      <ConfirmDeleteModal
        isOpen={modal.kind === "deleteColumn"}
        onClose={close}
        onConfirm={handleConfirmarDeletarColuna}
        title="Excluir coluna"
        description={modal.kind === "deleteColumn"
          ? `Tem certeza que deseja excluir a coluna "${modal.nome}"? As tarefas serão mantidas sem coluna e esta ação não pode ser desfeita.`
          : ""}
        confirmLabel="Excluir coluna"
        loading={modal.kind === "deleteColumn" && modal.loading}
      />

      <ToastContainer items={toast.toasts} onRemove={toast.remover} />
    </div>
  );
}
