import { Search, X } from "lucide-react";
import type { StatusFiltro } from "./types";
import { plural } from "./utils";

const FILTROS: Array<{ value: StatusFiltro; label: string }> = [
  { value: "TODOS", label: "Todos" },
  { value: "ATIVO", label: "Ativos" },
  { value: "PENDENTE", label: "Pendentes" },
  { value: "DESATIVADO", label: "Inativos" },
];

interface MembersToolbarProps {
  busca: string;
  statusFiltro: StatusFiltro;
  totalResultados: number;
  onBuscaChange: (value: string) => void;
  onStatusChange: (value: StatusFiltro) => void;
}

export function MembersToolbar({
  busca,
  statusFiltro,
  totalResultados,
  onBuscaChange,
  onStatusChange,
}: MembersToolbarProps) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-slate-100 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      {/* Label + count */}
      <div className="flex items-baseline gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Membros</h3>
        <span key={totalResultados} className="text-xs text-slate-400">
          {plural(totalResultados, "resultado", "resultados")}
        </span>
      </div>

      {/* Controles — empilha no mobile, inline no sm+ */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Campo de busca */}
        <label className="relative block sm:w-64">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            id="members-search"
            type="text"
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            placeholder="Buscar pessoa ou e-mail…"
            className="h-9 w-full rounded-md border border-slate-200 bg-white pl-8 pr-8 text-sm text-slate-800 outline-none placeholder:text-slate-400 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200/70"
          />
          {busca && (
            <button
              onClick={() => onBuscaChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              aria-label="Limpar busca"
            >
              <X size={13} />
            </button>
          )}
        </label>

        {/* Filtros — scroll horizontal no mobile sem mostrar scrollbar */}
        <div
          className="overflow-x-auto"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          <div className="inline-flex h-9 min-w-max items-center rounded-md bg-slate-100 p-0.5">
            {FILTROS.map((f) => (
              <button
                key={f.value}
                id={`filter-${f.value.toLowerCase()}`}
                onClick={() => onStatusChange(f.value)}
                className={`h-8 whitespace-nowrap rounded px-3 text-xs font-medium transition-all duration-150 ${
                  statusFiltro === f.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
