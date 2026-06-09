import { Filter, Plus, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { BoardViewTabs, type ViewMode } from "./BoardViewTabs";
import { useProjetosStore } from "@/store/useProjetosStore";

type KanbanHeaderProps = {
  projectName: string;
  onCreateColumn: () => void;
  onCreateTask: () => void;
  view: ViewMode;
  onChangeView: (view: ViewMode) => void;
  filtrosAbertos: boolean;
  temFiltroAtivo: boolean;
  onToggleFiltros: () => void;
  children?: ReactNode;
};

export function KanbanHeader({
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

  const seletorProjeto = (
    <div className="relative h-12 w-full max-w-full rounded-full bg-[#EDF2F8] p-1 sm:w-40">
      <select
        value={projetoAtual?.id || ""}
        onChange={(e) => {
          const selected = projetos.find((p) => p.id === e.target.value);
          definirProjetoAtivo(selected || null);
        }}
        className="h-10 w-full cursor-pointer appearance-none truncate rounded-full bg-white pl-4 pr-9 text-sm font-bold text-[#202A3D] shadow-[0_6px_18px_rgba(72,84,111,0.12)] transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#5B35F5]/20"
      >
        <option value="">Selecione um Projeto...</option>
        {projetos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#5147F5]"
      />
    </div>
  );

  return (
    <div className="border-b border-[#DFE7F2] bg-white">
      <section className="min-h-[130px] px-6 pb-5 pt-6 md:pt-16">
        <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-4 xl:flex-nowrap">
          <div className="order-1 grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#E6EAFF]">
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[#7578FF]">
              <div className="absolute inset-x-0 bottom-0 h-7 bg-[#5048E7]" />
            </div>
          </div>

          <div className="order-3 w-full min-w-0 xl:order-2 xl:w-auto xl:flex-1">
            <BoardViewTabs view={view} onChangeView={onChangeView}>
              <div className="hidden xl:block">{seletorProjeto}</div>
            </BoardViewTabs>
          </div>

          <div className="order-4 w-full xl:hidden">{seletorProjeto}</div>

          <div className="order-2 ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 xl:order-3">
            {children}

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
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4F58] text-[9px] font-bold text-white">
                  !
                </span>
              )}
            </button>

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
      </section>
    </div>
  );
}
