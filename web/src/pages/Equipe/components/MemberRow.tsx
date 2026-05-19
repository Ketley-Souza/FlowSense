import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, UserMinus, Users } from "lucide-react";
import type { UsuarioEquipe } from "@/types";
import { RoleBadge } from "./RoleBadge";
import { MemberStatus } from "./MemberStatus";
import {
  formatarData,
  formatarDataRelativa,
  getAvatarColor,
  getInitials,
} from "@/utils/equipe";

const DESKTOP_CLS =
  "hidden px-5 py-3 lg:grid lg:grid-cols-[minmax(0,1fr)_140px_120px_180px_44px] lg:items-center lg:gap-3";

interface MemberRowProps {
  membro: UsuarioEquipe;
}

export function MemberRow({ membro }: MemberRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const refMobile = useRef<HTMLDivElement>(null);
  const refDesktop = useRef<HTMLDivElement>(null);

  const atividadeLabel =
    membro.status === "PENDENTE"
      ? "Aguardando aceite"
      : formatarDataRelativa(membro.ativado_em);

  const atividadeTooltip =
    membro.status !== "PENDENTE" && membro.ativado_em
      ? formatarData(membro.ativado_em)
      : undefined;

  useEffect(() => {
    if (!menuOpen) return;

    function onOutside(event: MouseEvent) {
      const inMobile = refMobile.current?.contains(event.target as Node);
      const inDesktop = refDesktop.current?.contains(event.target as Node);
      if (!inMobile && !inDesktop) setMenuOpen(false);
    }

    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  const dropdown = menuOpen ? (
    <div className="absolute right-0 top-9 z-20 min-w-[168px] overflow-hidden rounded-xl border border-[#DDE7F3] bg-white py-1 shadow-[0_18px_38px_rgba(32,42,61,0.14)]">
      <button
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[#42516A] transition hover:bg-[#F8FBFF]"
        onClick={() => setMenuOpen(false)}
      >
        <Users size={14} className="text-[#9EB2CC]" />
        Alterar cargo
      </button>
      <div className="my-1 border-t border-[#EEF2F8]" />
      <button
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[#FF4F58] transition hover:bg-[#FFF1F2]"
        onClick={() => setMenuOpen(false)}
      >
        <UserMinus size={14} />
        Remover da equipe
      </button>
    </div>
  ) : null;

  const avatarNode = (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ring-2 ring-white"
      style={{ backgroundColor: getAvatarColor(membro.usuario_id) }}
      title={membro.usuario.nome}
    >
      {getInitials(membro.usuario.nome)}
    </div>
  );

  return (
    <div className="group relative border-b border-[#EEF2F8] transition-colors duration-100 hover:bg-[#F8FBFF]">
      <div className="flex items-center gap-3 px-4 py-3 lg:hidden">
        {avatarNode}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#202A3D]">{membro.usuario.nome}</p>
          <p className="truncate text-xs font-medium text-[#7E8DA6]">{membro.usuario.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <RoleBadge cargo={membro.cargo} />
            <MemberStatus status={membro.status} />
          </div>
        </div>
        <div className="relative shrink-0" ref={refMobile}>
          <button
            id={`member-actions-mobile-${membro.usuario_id}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#9EB2CC] transition hover:bg-[#EDF2F8] hover:text-[#42516A]"
            aria-label="Ações do membro"
          >
            <MoreHorizontal size={16} />
          </button>
          {dropdown}
        </div>
      </div>

      <div className={DESKTOP_CLS}>
        <div className="flex min-w-0 items-center gap-3">
          {avatarNode}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#202A3D]">{membro.usuario.nome}</p>
            <p className="truncate text-xs font-medium text-[#7E8DA6]">{membro.usuario.email}</p>
          </div>
        </div>
        <div>
          <RoleBadge cargo={membro.cargo} />
        </div>
        <div>
          <MemberStatus status={membro.status} />
        </div>
        <div className="text-xs font-medium text-[#7E8DA6]" title={atividadeTooltip}>
          {atividadeLabel}
        </div>
        <div className="relative flex justify-end" ref={refDesktop}>
          <button
            id={`member-actions-${membro.usuario_id}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#9EB2CC] opacity-0 transition hover:bg-[#EDF2F8] hover:text-[#42516A] group-hover:opacity-100"
            aria-label="Ações do membro"
          >
            <MoreHorizontal size={16} />
          </button>
          {dropdown}
        </div>
      </div>
    </div>
  );
}
