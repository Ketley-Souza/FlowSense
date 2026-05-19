import { Filter, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { BoardViewTabs, type ViewMode } from "./BoardViewTabs";
import { getUsuarioLogado } from "@/services/auth";

type KanbanHeaderProps = {
  projectName: string;
  activeProjectLabel?: string;
  onCreateColumn: () => void;
  onCreateTask: () => void;
  view: ViewMode;
  onChangeView: (view: ViewMode) => void;
  filtrosAbertos: boolean;
  temFiltroAtivo: boolean;
  onToggleFiltros: () => void;
  children?: ReactNode;
};

/**
 * Header principal do Kanban
 * Sem botão "Nova Tarefa" (as colunas já têm o "+")
 * Filtros com badge quando ativos
 */
export function KanbanHeader({
  projectName,
  activeProjectLabel,
  onCreateColumn,
  view,
  onChangeView,
  filtrosAbertos,
  temFiltroAtivo,
  onToggleFiltros,
  children,
}: KanbanHeaderProps) {
  const usuario = getUsuarioLogado();
  const nomeUsuario = usuario?.nome ?? "Usuário";
  const inicialUsuario = nomeUsuario.charAt(0).toUpperCase();

  return (
    <div className="border-b border-[#DFE7F2] bg-white">

      {/* Main section */}
      <section className="flex min-h-[130px] flex-col gap-5 px-6 py-5 xl:flex-row xl:items-center">
        {/* Avatar do projeto */}
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#E6EAFF]">
          <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[#7578FF]">
            <div className="absolute inset-x-0 bottom-0 h-7 bg-[#5048E7]" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {/* Título + ações */}
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-[22px] font-bold text-[#202A3D]">{projectName}</h1>
              {activeProjectLabel && (
                <p className="mt-0.5 text-sm font-medium text-[#7E8DA6]">{activeProjectLabel}</p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {children}

              {/* Filtros — badge quando ativo */}
              <button
                type="button"
                onClick={onToggleFiltros}
                className={[
                  "relative inline-flex h-[37px] items-center gap-2 rounded-full border px-4 text-sm font-semibold transition",
                  filtrosAbertos || temFiltroAtivo
                    ? "border-[#5B35F5] bg-[#EEF1FF] text-[#5B35F5]"
                    : "border-[#DDE7F3] bg-white text-[#344158] hover:bg-slate-50",
                ].join(" ")}
              >
                <Filter size={16} />
                Filtros
                {temFiltroAtivo && (
                  <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-[#FF4F58] text-[9px] font-bold text-white flex items-center justify-center">
                    !
                  </span>
                )}
              </button>

              {/* Criar Coluna */}
              <button
                type="button"
                onClick={onCreateColumn}
                className="inline-flex h-[37px] items-center gap-2 rounded-full bg-[#5B35F5] px-4 text-sm font-bold text-white shadow-[0_4px_12px_rgba(91,53,245,0.25)] transition hover:bg-[#4D2DE0]"
              >
                <Plus size={16} />
                Nova Coluna
              </button>
            </div>
          </div>

          {/* Views */}
          <BoardViewTabs view={view} onChangeView={onChangeView} />
        </div>
      </section>
    </div>
  );
}
