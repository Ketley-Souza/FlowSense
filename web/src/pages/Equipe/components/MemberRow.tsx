import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  onAlterarCargo: (membroId: string, novoCargo: "ADMIN" | "GERENTE" | "MEMBRO") => void;
  onRemover: (membroId: string) => void;
}

export function MemberRow({ membro, onAlterarCargo, onRemover }: MemberRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  const refMobile = useRef<HTMLDivElement>(null);
  const refDesktop = useRef<HTMLDivElement>(null);
  const refDropdown = useRef<HTMLDivElement>(null);
  const btnMobileRef = useRef<HTMLButtonElement>(null);
  const btnDesktopRef = useRef<HTMLButtonElement>(null);

  const atividadeLabel =
    membro.status === "PENDENTE"
      ? "Aguardando aceite"
      : formatarDataRelativa(membro.ativado_em);

  const atividadeTooltip =
    membro.status !== "PENDENTE" && membro.ativado_em
      ? formatarData(membro.ativado_em)
      : undefined;

  // Fecha ao clicar fora
  useEffect(() => {
    if (!menuOpen) return;
    function onOutside(event: MouseEvent) {
      const target = event.target as Node;
      const inMobile = refMobile.current?.contains(target);
      const inDesktop = refDesktop.current?.contains(target);
      const inDropdown = refDropdown.current?.contains(target);
      if (!inMobile && !inDesktop && !inDropdown) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  function openMenu(btnRef: React.RefObject<HTMLButtonElement | null>) {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + window.scrollY + 4,
      right: window.innerWidth - rect.right,
    });
    setMenuOpen((prev) => {
      if (!prev) setShowRoles(false); // Reset submenu state when opening
      return !prev;
    });
  }

  const handleRoleSelect = (novoCargo: "ADMIN" | "GERENTE" | "MEMBRO") => {
    onAlterarCargo(membro.usuario_id, novoCargo);
    setMenuOpen(false);
  };

  const handleRemover = () => {
    onRemover(membro.usuario_id);
    setMenuOpen(false);
  };

  // Portal — renderiza o dropdown fora da arvore da tabela
  const dropdown =
    menuOpen
      ? createPortal(
          <div
            ref={refDropdown}
            style={{
              position: "absolute",
              top: menuPos.top,
              right: menuPos.right,
              zIndex: 9999,
            }}
            className="min-w-[168px] overflow-hidden rounded-xl border border-[#DDE7F3] bg-white py-1 shadow-[0_18px_38px_rgba(32,42,61,0.14)]"
          >
            {!showRoles ? (
              <>
                <button
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[#42516A] transition hover:bg-[#F8FBFF]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRoles(true);
                  }}
                >
                  <Users size={14} className="text-[#9EB2CC]" />
                  Alterar cargo
                </button>
                <div className="my-1 border-t border-[#EEF2F8]" />
                <button
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[#FF4F58] transition hover:bg-[#FFF1F2]"
                  onClick={handleRemover}
                >
                  <UserMinus size={14} />
                  Remover da equipe
                </button>
              </>
            ) : (
              <>
                <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#9EB2CC]">
                  Selecione o cargo
                </div>
                {membro.cargo !== "ADMIN" && (
                  <button
                    className="flex w-full items-center px-3 py-2 text-left text-sm text-[#42516A] hover:bg-[#F8FBFF]"
                    onClick={() => handleRoleSelect("ADMIN")}
                  >
                    Admin
                  </button>
                )}
                {membro.cargo !== "GERENTE" && (
                  <button
                    className="flex w-full items-center px-3 py-2 text-left text-sm text-[#42516A] hover:bg-[#F8FBFF]"
                    onClick={() => handleRoleSelect("GERENTE")}
                  >
                    Gerente
                  </button>
                )}
                {membro.cargo !== "MEMBRO" && (
                  <button
                    className="flex w-full items-center px-3 py-2 text-left text-sm text-[#42516A] hover:bg-[#F8FBFF]"
                    onClick={() => handleRoleSelect("MEMBRO")}
                  >
                    Membro
                  </button>
                )}
                <div className="my-1 border-t border-[#EEF2F8]" />
                <button
                  className="flex w-full items-center px-3 py-2 text-left text-xs text-[#7E8DA6] hover:text-[#42516A]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRoles(false);
                  }}
                >
                  Voltar
                </button>
              </>
            )}
          </div>,
          document.body
        )
      : null;

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
      {/* Mobile */}
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
        <div className="shrink-0" ref={refMobile}>
          <button
            ref={btnMobileRef}
            id={`member-actions-mobile-${membro.usuario_id}`}
            onClick={() => openMenu(btnMobileRef)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#9EB2CC] transition hover:bg-[#EDF2F8] hover:text-[#42516A]"
            aria-label="Ações do membro"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Desktop */}
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
        <div className="flex justify-end" ref={refDesktop}>
          <button
            ref={btnDesktopRef}
            id={`member-actions-${membro.usuario_id}`}
            onClick={() => openMenu(btnDesktopRef)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#9EB2CC] opacity-0 transition hover:bg-[#EDF2F8] hover:text-[#42516A] group-hover:opacity-100"
            aria-label="Ações do membro"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {dropdown}
    </div>
  );
}
