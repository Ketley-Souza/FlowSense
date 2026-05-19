import { Mail, UserPlus, Users } from "lucide-react";
import type { UsuarioEquipe } from "@/types";
import { MemberRow } from "./MemberRow";
import { plural } from "./utils";

// Explicit lg: prefix on every class — Tailwind JIT cannot scan interpolated strings
const HEADER_DESKTOP_CLS =
  "hidden border-t border-slate-100 px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 lg:grid lg:grid-cols-[minmax(0,1fr)_140px_120px_180px_44px] lg:gap-3";

interface MembersListProps {
  membrosAtivos: UsuarioEquipe[];
  membrosPendentes: UsuarioEquipe[];
  busca: string;
  onClearBusca: () => void;
  onInvite: () => void;
}

export function MembersList({
  membrosAtivos,
  membrosPendentes,
  busca,
  onClearBusca,
  onInvite,
}: MembersListProps) {
  const total = membrosAtivos.length + membrosPendentes.length;

  /* ─── Estado: busca sem resultado ─── */
  if (total === 0 && busca) {
    return (
      <div className="border-t border-slate-100 px-5 py-14 text-center">
        <p className="text-sm font-semibold text-slate-800">
          Nenhum resultado para{" "}
          <span className="font-mono text-slate-950">"{busca}"</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Ajuste o termo ou limpe o filtro para ver todos os membros.
        </p>
        <button
          onClick={onClearBusca}
          className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Limpar busca
        </button>
      </div>
    );
  }

  /* ─── Estado: equipe vazia ─── */
  if (total === 0) {
    return (
      <div className="border-t border-slate-100 px-5 py-14 text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Users size={20} />
        </div>
        <p className="text-sm font-semibold text-slate-800">
          Esta equipe ainda não tem membros
        </p>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-400">
          Convide pessoas para organizar colaboração e permissões.
        </p>
        <button
          id="members-list-invite"
          onClick={onInvite}
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <UserPlus size={15} />
          Convidar membro
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Cabeçalho de colunas — desktop only */}
      <div className={HEADER_DESKTOP_CLS}>
        <span>Pessoa</span>
        <span>Cargo</span>
        <span>Status</span>
        <span>Atividade</span>
        <span />
      </div>

      {/* Membros ativos */}
      {membrosAtivos.length > 0 && (
        <div>
          {membrosAtivos.map((membro) => (
            <MemberRow key={membro.usuario_id} membro={membro} />
          ))}
        </div>
      )}

      {/* Convites pendentes */}
      {membrosPendentes.length > 0 && (
        <div className="border-t border-slate-100">
          {/* Banner de seção */}
          <div className="flex items-center justify-between border-l-2 border-amber-400 bg-amber-50/60 px-5 py-2.5">
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-amber-600" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-700">
                Convites pendentes
              </p>
            </div>
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200/60">
              {plural(membrosPendentes.length, "pessoa", "pessoas")}
            </span>
          </div>

          {membrosPendentes.map((membro) => (
            <MemberRow key={membro.usuario_id} membro={membro} />
          ))}
        </div>
      )}
    </div>
  );
}
