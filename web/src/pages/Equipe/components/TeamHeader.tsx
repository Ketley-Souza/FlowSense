import { Edit2, Trash2, UserPlus } from "lucide-react";
import type { Equipe } from "@/types";
import { getInitials, getAvatarColor, plural } from "./utils";

interface TeamHeaderProps {
  equipe: Equipe;
  totalMembros: number;
  totalAtivos: number;
  totalPendentes: number;
  onInvite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TeamHeader({
  equipe,
  totalMembros,
  totalAtivos,
  totalPendentes,
  onInvite,
  onEdit,
  onDelete,
}: TeamHeaderProps) {
  const initials = getInitials(equipe.nome).slice(0, 2);

  return (
    <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Identidade */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Avatar */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
          style={{ backgroundColor: getAvatarColor(equipe.id) }}
          aria-hidden
        >
          {initials[0] ?? "E"}
        </div>

        {/* Nome + meta */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-slate-950">
              {equipe.nome}
            </h2>
            {equipe.eh_pessoal && (
              <span className="inline-flex h-5 items-center rounded px-1.5 text-[10px] font-semibold uppercase tracking-widest text-sky-700 ring-1 ring-inset ring-sky-200 bg-sky-50">
                Pessoal
              </span>
            )}
          </div>

          {/* Chips de meta-informação */}
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-slate-400">
            <span>{plural(totalMembros, "pessoa", "pessoas")}</span>

            {totalAtivos > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-emerald-600">
                  {plural(totalAtivos, "ativa", "ativas")}
                </span>
              </>
            )}

            {totalPendentes > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-amber-600">
                  {plural(totalPendentes, "convite pendente", "convites pendentes")}
                </span>
              </>
            )}

            {equipe.descricao && (
              <>
                <span className="text-slate-300">·</span>
                <span className="truncate text-slate-400">{equipe.descricao}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          id="team-header-invite"
          onClick={onInvite}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <UserPlus size={15} />
          Convidar
        </button>

        {!equipe.eh_pessoal && (
          <>
            <button
              id="team-header-edit"
              onClick={onEdit}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              title="Editar equipe"
              aria-label="Editar equipe"
            >
              <Edit2 size={14} />
            </button>

            <button
              id="team-header-delete"
              onClick={onDelete}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-100 bg-white text-red-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              title="Excluir equipe"
              aria-label="Excluir equipe"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
