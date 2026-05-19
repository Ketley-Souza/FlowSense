import type { ReactNode } from "react";
import { Crown, ShieldCheck, User } from "lucide-react";

interface RoleConfig {
  label: string;
  icon: ReactNode;
  className: string;
  title: string;
}

const CONFIG: Record<string, RoleConfig> = {
  ADMIN: {
    label: "Admin",
    icon: <Crown size={11} />,
    className: "bg-[#FFF9E8] text-[#B87500] ring-[#F5A400]/25",
    title: "Acesso total: gerencia equipe e configurações",
  },
  GERENTE: {
    label: "Gerente",
    icon: <ShieldCheck size={11} />,
    className: "bg-[#EEF1FF] text-[#5147F5] ring-[#5B35F5]/20",
    title: "Gerencia projetos e membros da equipe",
  },
  MEMBRO: {
    label: "Membro",
    icon: <User size={11} />,
    className: "bg-[#F8FBFF] text-[#40506A] ring-[#DDE7F3]",
    title: "Acesso padrão aos projetos da equipe",
  },
};

interface RoleBadgeProps {
  cargo: string;
}

export function RoleBadge({ cargo }: RoleBadgeProps) {
  const config = CONFIG[cargo] ?? CONFIG.MEMBRO;

  return (
    <span
      className={`inline-flex h-[24px] items-center gap-1 rounded-full px-2 text-[11px] font-bold ring-1 ring-inset ${config.className}`}
      title={config.title}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
