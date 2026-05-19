import { Edit2, Trash2, UserPlus } from "lucide-react";
import type { Equipe } from "@/types";
import {
  getAvatarColor,
  getInitials,
  getTeamDisplayName,
  plural,
} from "@/utils/equipe";

interface TeamHeaderProps {
  equipe: Equipe;
  totalMembros: number;
  totalAtivos: number;
  onInvite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TeamHeader({
  equipe,
  totalMembros,
  totalAtivos,
  onInvite,
  onEdit,
  onDelete,
}: TeamHeaderProps) {
  const nomeEquipe = getTeamDisplayName(equipe);

  return (
    <div className="flex flex-col gap-4 border-b border-[#EEF2F8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
          style={{ backgroundColor: getAvatarColor(equipe.id) }}
          aria-hidden
        >
          {getInitials(nomeEquipe).slice(0, 2)}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-[#202A3D]">{nomeEquipe}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-[#7E8DA6]">
            <span>{plural(totalMembros, "pessoa", "pessoas")}</span>
            <span className="text-[#C9D3E1]">•</span>
            <span>{plural(totalAtivos, "ativo", "ativos")}</span>
            {equipe.descricao && (
              <>
                <span className="text-[#C9D3E1]">•</span>
                <span className="truncate">{equipe.descricao}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          id="team-header-invite"
          onClick={onInvite}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-[#5B35F5] px-4 text-sm font-bold text-white shadow-[0_4px_12px_rgba(91,53,245,0.22)] transition hover:bg-[#4D2DE0]"
        >
          <UserPlus size={16} />
          Convidar
        </button>

        {!equipe.eh_pessoal && (
          <>
            <button
              id="team-header-edit"
              onClick={onEdit}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#DDE7F3] bg-white text-[#42516A] transition hover:border-[#5B35F5] hover:text-[#5B35F5]"
              title="Editar equipe"
              aria-label="Editar equipe"
            >
              <Edit2 size={15} />
            </button>

            <button
              id="team-header-delete"
              onClick={onDelete}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#FFD6DA] bg-white text-[#FF4F58] transition hover:bg-[#FFF1F2]"
              title="Excluir equipe"
              aria-label="Excluir equipe"
            >
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
