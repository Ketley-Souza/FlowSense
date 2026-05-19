interface StatusConfig {
  label: string;
  dotClass: string;
  textClass: string;
  surfaceClass: string;
  ping: boolean;
  pulse: boolean;
}

const CONFIG: Record<string, StatusConfig> = {
  ATIVO: {
    label: "Ativo",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-700",
    surfaceClass: "bg-emerald-50 ring-emerald-200/70",
    ping: true,
    pulse: false,
  },
  PENDENTE: {
    label: "Pendente",
    dotClass: "bg-amber-400",
    textClass: "text-amber-700",
    surfaceClass: "bg-amber-50 ring-amber-200/70",
    ping: false,
    pulse: true,
  },
  DESATIVADO: {
    label: "Inativo",
    dotClass: "bg-slate-300",
    textClass: "text-slate-500",
    surfaceClass: "bg-slate-100 ring-slate-200/60",
    ping: false,
    pulse: false,
  },
};

interface MemberStatusProps {
  status: string;
}

export function MemberStatus({ status }: MemberStatusProps) {
  const config = CONFIG[status] ?? CONFIG.ATIVO;

  return (
    <span
      className={`inline-flex h-[22px] items-center gap-1.5 rounded px-1.5 text-[11px] font-semibold ring-1 ring-inset ${config.surfaceClass} ${config.textClass}`}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {config.ping && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${config.dotClass}`}
          />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${config.dotClass} ${
            config.pulse ? "animate-pulse" : ""
          }`}
        />
      </span>
      {config.label}
    </span>
  );
}
