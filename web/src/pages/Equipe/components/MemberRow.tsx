import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, UserMinus, Users } from "lucide-react";
import type { UsuarioEquipe } from "@/types";
import { RoleBadge } from "./RoleBadge";
import { MemberStatus } from "./MemberStatus";
import { getInitials, getAvatarColor, formatarData, formatarDataRelativa } from "./utils";

// Explicit classes so Tailwind JIT can scan them correctly
const DESKTOP_CLS =
  "hidden px-5 py-3 lg:grid lg:grid-cols-[minmax(0,1fr)_140px_120px_180px_44px] lg:items-center lg:gap-3";

interface MemberRowProps {
  membro: UsuarioEquipe;
}

export function MemberRow({ membro }: MemberRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const refMobile = useRef<HTMLDivElement>(null);
  const refDesktop = useRef<HTMLDivElement>(null);

  const entradaLabel =
    membro.status === "PENDENTE"
      ? "Aguardando aceite"
      : formatarDataRelativa(membro.ativado_em);

  const entradaTooltip =
    membro.status !== "PENDENTE" && membro.ativado_em
      ? formatarData(membro.ativado_em)
      : undefined;

  useEffect(() => {
    if (!menuOpen) return;
    function onOutside(e: MouseEvent) {
      const inMobile = refMobile.current?.contains(e.target as Node);
      const inDesktop = refDesktop.current?.contains(e.target as Node);
      if (!inMobile && !inDesktop) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  // Dropdown inlined — never define components inside render functions
  const dropdown = menuOpen ? (
    <div className="absolute right-0 top-9 z-20 min-w-[168px] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg shadow-slate-200/60">
      <button
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
        onClick={() => setMenuOpen(false)}
      >
        <Users size={14} className="text-slate-400" />
        Alterar cargo
      </button>
      <div className="my-1 border-t border-slate-100" />
      <button
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
        onClick={() => setMenuOpen(false)}
      >
        <UserMinus size={14} className="text-red-400" />
        Remover da equipe
      </button>
    </div>
  ) : null;

  const avatarNode = (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ring-2 ring-white shadow-sm"
      style={{ backgroundColor: getAvatarColor(membro.usuario_id) }}
      title={membro.usuario.nome}
    >
      {getInitials(membro.usuario.nome)}
    </div>
  );

  return (
    <div className="group relative border-t border-slate-100 transition-colors duration-100 hover:bg-slate-50">
      {/* ── Mobile (< lg) ── */}
      <div className="flex items-center gap-3 px-4 py-3 lg:hidden">
        {avatarNode}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{membro.usuario.nome}</p>
          <p className="truncate text-xs text-slate-400">{membro.usuario.email}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <RoleBadge cargo={membro.cargo} />
            <MemberStatus status={membro.status} />
          </div>
        </div>
        <div className="relative shrink-0" ref={refMobile}>
          <button
            id={`member-actions-mobile-${membro.usuario_id}`}
            onClick={() => setMenuOpen((p) => !p)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Ações do membro"
          >
            <MoreHorizontal size={15} />
          </button>
          {dropdown}
        </div>
      </div>

      {/* ── Desktop (lg+) ── */}
      <div className={DESKTOP_CLS}>
        <div className="flex min-w-0 items-center gap-3">
          {avatarNode}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{membro.usuario.nome}</p>
            <p className="truncate text-xs text-slate-400">{membro.usuario.email}</p>
          </div>
        </div>
        <div><RoleBadge cargo={membro.cargo} /></div>
        <div><MemberStatus status={membro.status} /></div>
        <div className="text-xs text-slate-500" title={entradaTooltip}>{entradaLabel}</div>
        <div className="relative flex justify-end" ref={refDesktop}>
          <button
            id={`member-actions-${membro.usuario_id}`}
            onClick={() => setMenuOpen((p) => !p)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
            aria-label="Ações do membro"
          >
            <MoreHorizontal size={15} />
          </button>
          {dropdown}
        </div>
      </div>
    </div>
  );
}
