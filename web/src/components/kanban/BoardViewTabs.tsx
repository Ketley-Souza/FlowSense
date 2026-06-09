import { Columns3, Grid2x2, List } from "lucide-react";
import type { ReactNode } from "react";

export type ViewMode = "kanban" | "lista" | "grade";

type BoardViewTabsProps = {
  view: ViewMode;
  onChangeView: (view: ViewMode) => void;
  children?: ReactNode;
};

/**
 * Abas para alternar visualizações do Kanban
 * Todas as três views são funcionais: colunas, lista e grade
 */
export function BoardViewTabs({ view, onChangeView, children }: BoardViewTabsProps) {
  const tabs: { label: string; icon: typeof Columns3; value: ViewMode }[] = [
    { label: "Em Colunas", icon: Columns3, value: "kanban" },
    { label: "Em Grade", icon: Grid2x2, value: "grade" },
    { label: "Em Lista", icon: List, value: "lista" },
  ];

  return (
    <div className="flex w-full max-w-full flex-wrap items-center gap-2">
      <div className="inline-flex min-h-12 max-w-full flex-wrap items-center overflow-hidden rounded-full bg-[#EDF2F8] p-1">
        {tabs.map(({ label, icon: Icon, value }) => {
          const isActive = view === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChangeView(value)}
              className={[
                "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition sm:px-5",
                isActive
                  ? "bg-white text-[#202A3D] shadow-[0_6px_18px_rgba(72,84,111,0.12)]"
                  : "text-[#4C5B73] hover:text-[#202A3D] hover:bg-white/60",
              ].join(" ")}
            >
              <Icon size={18} className={isActive ? "text-[#5147F5]" : ""} />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </div>
      {children}
    </div>
  );
}
