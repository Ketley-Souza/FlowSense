import { Plus } from "lucide-react";
import type { Equipe } from "@/types";
import { getAvatarColor, getTeamDisplayName } from "@/utils/equipe";

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
    <div className="overflow-x-auto pb-px" style={{ scrollbarWidth: "none" }}>
      <div className="inline-flex min-w-max items-center gap-1 rounded-full bg-[#EDF2F8] p-1">
        {equipes.map((equipe) => {
          const ativa = equipeAtiva?.id === equipe.id;
          return (
            <button
              key={equipe.id}
              id={`team-tab-${equipe.id}`}
              onClick={() => onSelect(equipe)}
              className={[
                "inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-bold transition",
                ativa
                  ? "bg-white text-[#202A3D] shadow-[0_6px_18px_rgba(72,84,111,0.12)]"
                  : "text-[#4C5B73] hover:bg-white/60 hover:text-[#202A3D]",
              ].join(" ")}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: ativa ? "#5B35F5" : getAvatarColor(equipe.id) }}
              />
              {getTeamDisplayName(equipe)}
            </button>
          );
        })}

        {onNova && (
          <button
            id="team-switcher-nova"
            onClick={onNova}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-[#5B35F5] transition hover:bg-white/70"
          >
            <Plus size={15} />
            Nova equipe
          </button>
        )}
      </div>
    </div>
  );
}
