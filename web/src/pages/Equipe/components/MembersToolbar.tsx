import { Search, X } from "lucide-react";
import type { StatusFiltro } from "@/types";
import { plural } from "@/utils/equipe";

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
    <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-baseline gap-2">
        <h3 className="text-sm font-bold text-[#202A3D]">Membros</h3>
        <span key={totalResultados} className="text-xs font-medium text-[#7E8DA6]">
          {plural(totalResultados, "resultado", "resultados")}
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative block sm:w-72">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9EB2CC]"
          />
          <input
            id="members-search"
            type="text"
            value={busca}
            onChange={(event) => onBuscaChange(event.target.value)}
            placeholder="Buscar pessoa ou e-mail..."
            className="h-10 w-full rounded-full border border-[#DDE7F3] bg-white pl-9 pr-9 text-sm text-[#202A3D] outline-none placeholder:text-[#9EB2CC] transition focus:border-[#5B35F5] focus:ring-2 focus:ring-[#5B35F5]/10"
          />
          {busca && (
            <button
              onClick={() => onBuscaChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9EB2CC] transition hover:text-[#42516A]"
              aria-label="Limpar busca"
            >
              <X size={14} />
            </button>
          )}
        </label>

        <div
          className="overflow-x-auto"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          <div className="inline-flex h-10 min-w-max items-center rounded-full bg-[#EDF2F8] p-1">
            {FILTROS.map((filtro) => (
              <button
                key={filtro.value}
                id={`filter-${filtro.value.toLowerCase()}`}
                onClick={() => onStatusChange(filtro.value)}
                className={[
                  "h-8 whitespace-nowrap rounded-full px-3 text-xs font-bold transition",
                  statusFiltro === filtro.value
                    ? "bg-white text-[#202A3D] shadow-[0_6px_18px_rgba(72,84,111,0.12)]"
                    : "text-[#4C5B73] hover:bg-white/60 hover:text-[#202A3D]",
                ].join(" ")}
              >
                {filtro.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
