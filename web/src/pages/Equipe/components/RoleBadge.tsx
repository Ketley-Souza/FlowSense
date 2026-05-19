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
    className: "bg-amber-50 text-amber-700 ring-amber-200/70",
    title: "Acesso total — gerencia equipe e configurações",
  },
  GERENTE: {
    label: "Gerente",
    icon: <ShieldCheck size={11} />,
    className: "bg-sky-50 text-sky-700 ring-sky-200/70",
    title: "Gerencia projetos e membros da equipe",
  },
  MEMBRO: {
    label: "Membro",
    icon: <User size={11} />,
    className: "bg-slate-100 text-slate-600 ring-slate-200/60",
    title: "Acesso padrão a projetos da equipe",
  },
};

interface RoleBadgeProps {
  cargo: string;
}

export function RoleBadge({ cargo }: RoleBadgeProps) {
  const config = CONFIG[cargo] ?? CONFIG.MEMBRO;

  return (
    <span
      className={`inline-flex h-[22px] items-center gap-1 rounded px-1.5 text-[11px] font-semibold ring-1 ring-inset ${config.className}`}
      title={config.title}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
