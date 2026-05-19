import { UserPlus, Users } from "lucide-react";
import type { UsuarioEquipe } from "@/types";
import { MemberRow } from "./MemberRow";

const HEADER_DESKTOP_CLS =
  "hidden border-y border-[#EEF2F8] bg-[#F8FBFF] px-5 py-2 text-[11px] font-bold uppercase tracking-wide text-[#9EB2CC] lg:grid lg:grid-cols-[minmax(0,1fr)_140px_120px_180px_44px] lg:gap-3";

interface MembersListProps {
  membros: UsuarioEquipe[];
  busca: string;
  onClearBusca: () => void;
  onInvite: () => void;
}

export function MembersList({
  membros,
  busca,
  onClearBusca,
  onInvite,
}: MembersListProps) {
  if (membros.length === 0 && busca) {
    return (
      <div className="border-t border-[#EEF2F8] px-5 py-14 text-center">
        <p className="text-sm font-bold text-[#202A3D]">
          Nenhum resultado para <span className="font-mono">"{busca}"</span>
        </p>
        <p className="mt-1 text-xs text-[#7E8DA6]">
          Ajuste o termo ou limpe o filtro para ver todos os membros.
        </p>
        <button
          onClick={onClearBusca}
          className="mt-4 inline-flex h-9 items-center rounded-full border border-[#DDE7F3] bg-white px-4 text-xs font-bold text-[#42516A] transition hover:border-[#5B35F5] hover:text-[#5B35F5]"
        >
          Limpar busca
        </button>
      </div>
    );
  }

  if (membros.length === 0) {
    return (
      <div className="border-t border-[#EEF2F8] px-5 py-14 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF1FF] text-[#5B35F5]">
          <Users size={20} />
        </div>
        <p className="text-sm font-bold text-[#202A3D]">
          Esta equipe ainda não tem membros
        </p>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#7E8DA6]">
          Convide pessoas para organizar colaboração e permissões.
        </p>
        <button
          id="members-list-invite"
          onClick={onInvite}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-[#5B35F5] px-4 text-sm font-bold text-white transition hover:bg-[#4D2DE0]"
        >
          <UserPlus size={16} />
          Convidar membro
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className={HEADER_DESKTOP_CLS}>
        <span>Pessoa</span>
        <span>Cargo</span>
        <span>Status</span>
        <span>Atividade</span>
        <span />
      </div>

      {membros.map((membro) => (
        <MemberRow key={`${membro.usuario_id}-${membro.status}`} membro={membro} />
      ))}
    </div>
  );
}
