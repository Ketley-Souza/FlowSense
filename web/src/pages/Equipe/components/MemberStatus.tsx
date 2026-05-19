interface StatusConfig {
  label: string;
  dotClass: string;
  className: string;
}

const CONFIG: Record<string, StatusConfig> = {
  ATIVO: {
    label: "Ativo",
    dotClass: "bg-indigo-500",
    className: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
  },
  PENDENTE: {
    label: "Pendente",
    dotClass: "bg-slate-500",
    className: "bg-slate-50 text-slate-700 ring-slate-200/70",
  },
  DESATIVADO: {
    label: "Inativo",
    dotClass: "bg-[#9EB2CC]",
    className: "bg-[#EDF2F8] text-[#4C5B73] ring-[#DDE7F3]",
  },
};

interface MemberStatusProps {
  status: string;
}

export function MemberStatus({ status }: MemberStatusProps) {
  const config = CONFIG[status] ?? CONFIG.ATIVO;

  return (
    <span
      className={`inline-flex h-[24px] items-center gap-1.5 rounded-full px-2 text-[11px] font-bold ring-1 ring-inset ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
