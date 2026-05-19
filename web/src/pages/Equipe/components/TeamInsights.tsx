import type { ReactNode } from "react";
import { Activity, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { plural } from "./utils";

interface InsightCellProps {
  icon: ReactNode;
  iconClass: string;
  label: string;
  value: string | number;
  helper: string;
  highlight?: boolean;
}

function InsightCell({
  icon,
  iconClass,
  label,
  value,
  helper,
  highlight = false,
}: InsightCellProps) {
  return (
    <div
      className={`min-w-[120px] px-3 py-3 transition-colors sm:px-5 sm:py-4 ${
        highlight ? "bg-amber-50/50" : ""
      }`}
    >
      <div
        className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}
      >
        {icon}
      </div>
      <div className="text-xl font-semibold tabular-nums tracking-tight text-slate-950">
        {value}
      </div>
      <div className="mt-0.5 text-sm font-medium text-slate-600">{label}</div>
      <p className="mt-1 text-xs leading-5 text-slate-400">{helper}</p>
    </div>
  );
}

interface TeamInsightsProps {
  totalMembros: number;
  totalAtivos: number;
  totalPendentes: number;
  totalGestores: number;
}

export function TeamInsights({
  totalMembros,
  totalAtivos,
  totalPendentes,
  totalGestores,
}: TeamInsightsProps) {
  const taxaAtivacao =
    totalMembros === 0 ? 0 : Math.round((totalAtivos / totalMembros) * 100);

  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-t border-b border-slate-100 sm:grid-cols-4">
      <InsightCell
        icon={<Users size={16} />}
        iconClass="bg-violet-50 text-violet-600"
        label="Pessoas"
        value={totalMembros}
        helper={
          totalAtivos > 0
            ? plural(totalAtivos, "com acesso ativo", "com acesso ativo")
            : "Base pronta para crescer"
        }
      />
      <InsightCell
        icon={<CheckCircle2 size={16} />}
        iconClass="bg-emerald-50 text-emerald-600"
        label="Ativação"
        value={`${taxaAtivacao}%`}
        helper={
          totalPendentes > 0 ? "Convites ainda em aberto" : "Equipe sem bloqueios"
        }
      />
      <InsightCell
        icon={<ShieldCheck size={16} />}
        iconClass="bg-sky-50 text-sky-600"
        label="Gestão"
        value={totalGestores}
        helper={
          totalGestores > 0
            ? "Responsáveis definidos"
            : "Defina líderes da equipe"
        }
      />
      <InsightCell
        icon={<Activity size={16} />}
        iconClass={
          totalPendentes > 0
            ? "bg-amber-50 text-amber-600"
            : "bg-slate-100 text-slate-500"
        }
        label="Ritmo"
        value={totalPendentes > 0 ? "Atenção" : "Fluido"}
        helper={
          totalPendentes > 0
            ? "Acompanhe os aceites pendentes"
            : "Operação pronta para colaborar"
        }
        highlight={totalPendentes > 0}
      />
    </div>
  );
}
