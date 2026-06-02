import { Filter, Plus, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { BoardViewTabs, type ViewMode } from "./BoardViewTabs";
import { getUsuarioLogado } from "@/services/auth";
import { useProjetosStore } from "@/store/useProjetosStore";

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
  const { projetos, projetoAtual, definirProjetoAtivo, listar } = useProjetosStore();

  useEffect(() => {
    if (projetos.length === 0) {
      listar().catch(console.error);
    }
  }, [projetos.length, listar]);

  const usuario = getUsuarioLogado();
  const nomeUsuario = usuario?.nome ?? "Usuário";
  const inicialUsuario = nomeUsuario.charAt(0).toUpperCase();

  return (
    <div className="border-b border-[#DFE7F2] bg-white">

      {/* Main section */}
      <section className="flex min-h-[130px] flex-col gap-5 px-6 pt-6 md:pt-16 pb-5 xl:flex-row xl:items-center">
        {/* Avatar do projeto */}
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#E6EAFF]">
          <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[#7578FF]">
            <div className="absolute inset-x-0 bottom-0 h-7 bg-[#5048E7]" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {/* Título + ações */}
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={projetoAtual?.id || ""}
                  onChange={(e) => {
                    const selected = projetos.find((p) => p.id === e.target.value);
                    definirProjetoAtivo(selected || null);
                  }}
                  className="appearance-none pr-9 pl-4 py-2 bg-[#F4F7FB] border border-[#DDE7F3] rounded-xl text-lg font-bold text-[#202A3D] focus:outline-none focus:ring-2 focus:ring-[#5B35F5]/20 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <option value="">Selecione um Projeto...</option>
                  {projetos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7E8DA6]"
                />
              </div>
              {activeProjectLabel && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#EEF1FF] text-[#5B35F5] text-xs font-bold border border-[#DDE7F3]">
                  {activeProjectLabel}
                </span>
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
