import { CheckCircle2, Clock3, ShieldCheck, Users } from "lucide-react";
import { plural } from "@/utils/equipe";

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

  const metrics = [
    {
      label: "Pessoas",
      value: totalMembros,
      detail: totalAtivos > 0 ? plural(totalAtivos, "com acesso", "com acesso") : "sem acesso ativo",
      icon: Users,
    },
    {
      label: "Ativação",
      value: `${taxaAtivacao}%`,
      detail: totalPendentes > 0 ? plural(totalPendentes, "pendente", "pendentes") : "sem pendências",
      icon: CheckCircle2,
    },
    {
      label: "Gestão",
      value: totalGestores,
      detail: plural(totalGestores, "responsável", "responsáveis"),
      icon: ShieldCheck,
    },
    {
      label: "Ritmo",
      value: totalPendentes > 0 ? "Revisar" : "Fluido",
      detail: totalPendentes > 0 ? "há convites abertos" : "pronto para colaborar",
      icon: Clock3,
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-[#EEF2F8] bg-[#F8FBFF] px-5 py-3 sm:grid-cols-4">
      {metrics.map(({ label, value, detail, icon: Icon }) => (
        <div key={label} className="min-w-0">
          <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#9EB2CC]">
            <Icon size={13} className="text-[#5B35F5]" />
            {label}
          </dt>
          <dd className="mt-1 flex min-w-0 items-baseline gap-2">
            <span className="text-base font-bold text-[#202A3D]">{value}</span>
            <span className="truncate text-xs font-medium text-[#7E8DA6]">{detail}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
