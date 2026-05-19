import { Plus } from "lucide-react";
import type { Equipe } from "@/types";
import { getAvatarColor } from "./utils";

interface TeamSwitcherProps {
  equipes: Equipe[];
  equipeAtiva: Equipe | null;
  onSelect: (equipe: Equipe) => void;
  onNova?: () => void;
}

export function TeamSwitcher({
  equipes,
  equipeAtiva,
  onSelect,
  onNova,
}: TeamSwitcherProps) {
  return (
    <div className="relative">
      {/* Fade lateral esquerdo */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-3 bg-gradient-to-r from-slate-50 to-transparent" />
      {/* Fade lateral direito */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-3 bg-gradient-to-l from-slate-50 to-transparent" />

      <div className="overflow-x-auto pb-px" style={{ scrollbarWidth: "none" }}>
        <div className="inline-flex min-w-max items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm shadow-slate-200/40">
          {equipes.map((equipe) => {
            const ativa = equipeAtiva?.id === equipe.id;
            return (
              <button
                key={equipe.id}
                id={`team-tab-${equipe.id}`}
                onClick={() => onSelect(equipe)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-all duration-150 ${
                  ativa
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: ativa
                      ? "rgba(255,255,255,0.55)"
                      : getAvatarColor(equipe.id),
                  }}
                />
                {equipe.nome}
                {equipe.eh_pessoal && (
                  <span
                    className={`text-[10px] font-normal ${
                      ativa ? "text-white/50" : "text-slate-400"
                    }`}
                  >
                    pessoal
                  </span>
                )}
              </button>
            );
          })}

          {/* Divisor + botão Nova equipe */}
          {onNova && (
            <>
              {equipes.length > 0 && (
                <div className="mx-0.5 h-5 w-px shrink-0 bg-slate-200" />
              )}
              <button
                id="team-switcher-nova"
                onClick={onNova}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed border-slate-300 px-2.5 text-xs font-medium text-slate-500 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700"
              >
                <Plus size={12} />
                Nova
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
