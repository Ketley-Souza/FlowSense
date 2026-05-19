import { useEffect, useMemo, useState } from "react";
import { CreateTaskModal } from "./CreateTaskModal";
import { EditTaskModal } from "./EditTaskModal";
import { CreateColumnModal } from "./CreateColumnModal";
import { ToastContainer, useToast } from "@/components/Toast";

import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanHeader } from "@/components/kanban/KanbanHeader";
import { TaskCard } from "@/components/kanban/TaskCard";
import { buildBoardColumns } from "@/utils/kanban";
import type { ViewMode } from "@/components/kanban/BoardViewTabs";

import { useProjetosStore } from "@/store/useProjetosStore";
import { useTarefasStore } from "@/store/useTarefasStore";
import type { CriarTarefaPayload } from "@/types";

const PRIORIDADE_LABEL: Record<string, string> = {
  BAIXA: "Sem urgência",
  MEDIA: "Importante",
  ALTA: "Alta Prioridade",
};

type FiltrosPainel = {
  prioridade: "" | "BAIXA" | "MEDIA" | "ALTA";
  busca: string;
};

export default function Kanban() {
  const { tarefas, carregando, erro, listar, listarPorProjeto, criar, deletar } =
    useTarefasStore();
  const { projetoAtual, criarColuna, deletarColuna } = useProjetosStore();
  const toast = useToast();

  const [view, setView] = useState<ViewMode>("kanban");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosPainel>({ prioridade: "", busca: "" });

  // ID da tarefa selecionada — a tarefa em si é derivada do store (auto-atualiza)
  const [tarefaSelecionadaId, setTarefaSelecionadaId] = useState<string | null>(null);
  const tarefaSelecionada = useMemo(
    () => tarefas.find((t) => t.id === tarefaSelecionadaId) ?? null,
    [tarefas, tarefaSelecionadaId]
  );

  const [colunaInicialId, setColunaInicialId] = useState<string | undefined>();

  // Carregar tarefas ao montar / trocar projeto
  useEffect(() => {
    if (projetoAtual?.id) {
      listarPorProjeto(projetoAtual.id);
    } else {
      listar();
    }
  }, [projetoAtual?.id, listar, listarPorProjeto]);

  // Filtrar tarefas do projeto atual + filtros do painel
  const tarefasDoProjeto = useMemo(() => {
    let lista = projetoAtual
      ? tarefas.filter((t) => t.id_projeto === projetoAtual.id)
      : tarefas;

    if (filtros.busca.trim()) {
      const termo = filtros.busca.toLowerCase();
      lista = lista.filter(
        (t) =>
          t.titulo.toLowerCase().includes(termo) ||
          t.descricao?.toLowerCase().includes(termo)
      );
    }

    if (filtros.prioridade) {
      lista = lista.filter((t) => t.prioridade === filtros.prioridade);
    }

    return lista;
  }, [projetoAtual, tarefas, filtros]);

  // Construir colunas — sempre mostra as colunas do projeto
  const boardColumns = useMemo(
    () => buildBoardColumns(tarefasDoProjeto, projetoAtual?.colunas ?? []),
    [projetoAtual?.colunas, tarefasDoProjeto]
  );

  // Colunas e membros/tags para modais
  const colunasParaModal = useMemo(
    () => (projetoAtual?.colunas ?? []).map((c) => ({ id: c.id, nome: c.nome })),
    [projetoAtual?.colunas]
  );
  const membrosDoProejto = projetoAtual?.membros ?? [];
  const tagsDoProejto = projetoAtual?.tags ?? [];

  // ── Handlers ────────────────────────────────────────────────

  async function handleCriarTarefa(payload: Omit<CriarTarefaPayload, "id_projeto">): Promise<void> {
    const idProjeto = projetoAtual?.id;
    if (!idProjeto) {
      toast.erro("Selecione um projeto antes de criar tarefas.");
      return;
    }
    try {
      await criar({ ...payload, id_projeto: idProjeto });
      setCreateModalOpen(false);
      setColunaInicialId(undefined);
      toast.sucesso("Tarefa criada com sucesso!");
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao criar tarefa");
    }
  }

  async function handleDeletarTarefa(): Promise<void> {
    if (!tarefaSelecionadaId) return;
    try {
      await deletar(tarefaSelecionadaId);
      setEditModalOpen(false);
      setTarefaSelecionadaId(null);
      toast.sucesso("Tarefa excluída com sucesso!");
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao excluir tarefa");
    }
  }

  async function handleCriarColuna(nome: string): Promise<void> {
    if (!projetoAtual?.id) {
      toast.erro("Selecione um projeto para criar colunas.");
      return;
    }
    try {
      await criarColuna(projetoAtual.id, nome);
      toast.sucesso(`Coluna "${nome}" criada!`);
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao criar coluna");
    }
  }

  async function handleDeletarColuna(colunaId: string, nomeColuna: string): Promise<void> {
    if (!projetoAtual?.id) return;
    if (!confirm(`Excluir a coluna "${nomeColuna}"? As tarefas serão mantidas sem coluna.`)) return;
    try {
      await deletarColuna(projetoAtual.id, colunaId);
      toast.sucesso(`Coluna "${nomeColuna}" excluída.`);
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : "Erro ao excluir coluna");
    }
  }

  function openCreateTask(columnId?: string) {
    setColunaInicialId(columnId);
    setCreateModalOpen(true);
  }

  function openEditTask(tarefaId: string) {
    setTarefaSelecionadaId(tarefaId);
    setEditModalOpen(true);
  }

  // ── Views ───────────────────────────────────────────────────

  function renderKanban() {
    return (
      // Scroll horizontal, colunas em linha com largura fixa
      <div className="flex gap-5 min-w-max">
        {boardColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            columnId={column.formColumnId}
            title={column.title}
            count={column.tarefas.length}
            dotColor={column.dotColor}
            progressColor={column.progressColor}
            tarefas={column.tarefas}
            onAddTask={() => openCreateTask(column.formColumnId)}
            onSelectTask={(t) => openEditTask(t.id)}
            onDeleteColumn={
              column.formColumnId
                ? () => handleDeletarColuna(column.formColumnId!, column.title)
                : undefined
            }
          />
        ))}
      </div>
    );
  }

  function renderLista() {
    return (
      <div className="w-full overflow-x-auto rounded-2xl border border-[#DDE7F3] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EEF2F8] bg-[#F8FBFF]">
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#9EB2CC]">Tarefa</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#9EB2CC]">Coluna</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#9EB2CC]">Prioridade</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#9EB2CC]">Progresso</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#9EB2CC]">Prazo</th>
            </tr>
          </thead>
          <tbody>
            {tarefasDoProjeto.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-[#9EB2CC]">
                  Nenhuma tarefa encontrada
                </td>
              </tr>
            ) : (
              tarefasDoProjeto.map((t) => {
                const prog = t.subtarefas?.length
                  ? Math.round((t.subtarefas.filter((s) => s.concluida).length / t.subtarefas.length) * 100)
                  : t.progresso;
                return (
                  <tr
                    key={t.id}
                    onClick={() => openEditTask(t.id)}
                    className="cursor-pointer border-b border-[#EEF2F8] transition hover:bg-[#F8FBFF]"
                  >
                    <td className="px-5 py-3">
                      <p className="font-semibold text-[#202A3D]">{t.titulo}</p>
                      {t.descricao && <p className="text-xs text-[#9EB2CC] truncate max-w-[260px]">{t.descricao}</p>}
                    </td>
                    <td className="px-4 py-3 text-[#40506A]">{t.coluna?.nome ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={[
                        "rounded-full px-2.5 py-0.5 text-xs font-bold",
                        t.prioridade === "ALTA" ? "bg-[#FFF1F2] text-[#FF4F58]"
                          : t.prioridade === "MEDIA" ? "bg-[#FFF9E8] text-[#F5A400]"
                          : "bg-[#EEF1FF] text-[#5147F5]"
                      ].join(" ")}>
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
                      {t.data_fim ? new Date(t.data_fim).toLocaleDateString("pt-BR")
                        : t.prazo ? new Date(t.prazo).toLocaleDateString("pt-BR") : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  }

  function renderGrade() {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {tarefasDoProjeto.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-[#9EB2CC]">
            Nenhuma tarefa encontrada
          </div>
        ) : (
          tarefasDoProjeto.map((t) => (
            <TaskCard
              key={t.id}
              tarefa={t}
              progressColor="#5B35F5"
              onClick={() => openEditTask(t.id)}
            />
          ))
        )}
      </div>
    );
  }

  const temFiltroAtivo = filtros.prioridade || filtros.busca.trim();

  return (
    <div className="-m-6 min-h-screen bg-[#F4F7FB] font-sans text-[#202A3D]">
      <KanbanHeader
        projectName={projetoAtual?.nome ?? "Selecione um Projeto"}
        activeProjectLabel={projetoAtual ? "Projeto ativo" : undefined}
        onCreateColumn={() => setColumnModalOpen(true)}
        onCreateTask={() => openCreateTask()}
        view={view}
        onChangeView={setView}
        filtrosAbertos={filtrosAbertos}
        temFiltroAtivo={!!temFiltroAtivo}
        onToggleFiltros={() => setFiltrosAbertos((v) => !v)}
      />

      {/* Painel de filtros */}
      {filtrosAbertos && (
        <div className="border-b border-[#DDE7F3] bg-white px-6 py-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* Busca */}
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-xs font-semibold text-[#9EB2CC] uppercase tracking-wide">
                Buscar
              </label>
              <input
                type="text"
                value={filtros.busca}
                onChange={(e) => setFiltros((f) => ({ ...f, busca: e.target.value }))}
                placeholder="Título ou descrição..."
                className="w-full rounded-xl border border-[#DDE7F3] bg-[#F8FBFF] px-3 py-2 text-sm text-[#202A3D] placeholder-[#9EB2CC] outline-none focus:border-[#5B35F5] focus:ring-2 focus:ring-[#5B35F5]/10"
              />
            </div>

            {/* Prioridade */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#9EB2CC] uppercase tracking-wide">
                Prioridade
              </label>
              <div className="flex gap-2">
                {(["", "BAIXA", "MEDIA", "ALTA"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFiltros((f) => ({ ...f, prioridade: p }))}
                    className={[
                      "rounded-full px-3 py-1.5 text-xs font-bold border transition",
                      filtros.prioridade === p
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

            {/* Limpar */}
            {temFiltroAtivo && (
              <button
                type="button"
                onClick={() => setFiltros({ prioridade: "", busca: "" })}
                className="text-sm font-semibold text-[#FF4F58] hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Erro */}
      {erro && (
        <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erro}
        </div>
      )}

      {/* Loading */}
      {carregando && tarefas.length === 0 ? (
        <main className="grid min-h-[420px] place-items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5B35F5] border-t-transparent" />
            <p className="text-sm font-medium text-[#7E8DA6]">Carregando tarefas...</p>
          </div>
        </main>
      ) : (
        <main className="overflow-x-auto px-6 py-8">
          {view === "kanban" && renderKanban()}
          {view === "lista" && renderLista()}
          {view === "grade" && renderGrade()}
        </main>
      )}

      {/* Modais */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => { setCreateModalOpen(false); setColunaInicialId(undefined); }}
        onSubmit={handleCriarTarefa}
        colunas={colunasParaModal}
        membros={membrosDoProejto}
        tagsExistentes={tagsDoProejto}
        colunaInicialId={colunaInicialId}
      />

      <EditTaskModal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setTarefaSelecionadaId(null); }}
        onEdit={() => {}}
        onDelete={handleDeletarTarefa}
        task={tarefaSelecionada ?? undefined}
      />

      <CreateColumnModal
        isOpen={columnModalOpen}
        onClose={() => setColumnModalOpen(false)}
        onSubmit={handleCriarColuna}
      />

      <ToastContainer items={toast.toasts} onRemove={toast.remover} />
    </div>
  );
}