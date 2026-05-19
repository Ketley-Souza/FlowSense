import { Activity, CheckCircle2, Clock, Mail } from "lucide-react";
import type { Equipe, UsuarioEquipe } from "@/types";
import {
  formatarData,
  formatarDataRelativa,
  getAvatarColor,
  getInitials,
  plural,
} from "./utils";

interface ActivitySnapshotProps {
  membros: UsuarioEquipe[];
  totalPendentes: number;
  equipe: Equipe;
}

export function ActivitySnapshot({
  membros,
  totalPendentes,
  equipe,
}: ActivitySnapshotProps) {
  /* Membros ativos ordenados por data de ativação (mais recente primeiro) */
  const ativosOrdenados = [...membros]
    .filter((m) => m.status === "ATIVO" && m.ativado_em)
    .sort(
      (a, b) =>
        new Date(b.ativado_em ?? 0).getTime() -
        new Date(a.ativado_em ?? 0).getTime()
    );

  const ultimoAtivo = ativosOrdenados[0];
  const recentes = ativosOrdenados.slice(0, 3);
  const totalAtivos = membros.filter((m) => m.status === "ATIVO").length;

  const items = [
    {
      id: "criada-em",
      icon: <Clock size={14} />,
      iconClass: "bg-slate-100 text-slate-500",
      label: "Criada em",
      value: formatarData(equipe.createdAt),
    },
    {
      id: "ultima-ativacao",
      icon: <CheckCircle2 size={14} />,
      iconClass: "bg-emerald-50 text-emerald-600",
      label: "Última ativação",
      value: ultimoAtivo
        ? `${ultimoAtivo.usuario.nome} · ${formatarDataRelativa(ultimoAtivo.ativado_em)}`
        : "Sem ativações registradas",
    },
    {
      id: "fila-convites",
      icon: <Mail size={14} />,
      iconClass:
        totalPendentes > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500",
      label: "Fila de convites",
      value: totalPendentes
        ? plural(totalPendentes, "aceite pendente", "aceites pendentes")
        : "Sem pendências",
    },
  ];

  return (
    <aside className="rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3.5">
        <Activity size={14} className="text-slate-400" />
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Sinais da equipe</h3>
          <p className="text-xs text-slate-400">Resumo operacional rápido</p>
        </div>
      </div>

      {/* Alerta de pendentes */}
      {totalPendentes > 0 && (
        <div className="border-b border-amber-100 bg-amber-50/70 px-4 py-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-amber-700">
              {plural(totalPendentes, "convite aguarda", "convites aguardam")} aceite
            </p>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
              {totalPendentes}
            </span>
          </div>
        </div>
      )}

      {/* Itens de sinal */}
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 px-4 py-3">
            <div
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${item.iconClass}`}
            >
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {item.label}
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-slate-800">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Stack de avatares dos recentes */}
      {recentes.length > 0 && (
        <div className="border-t border-slate-100 px-4 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Entradas recentes
          </p>
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {recentes.map((m) => (
                <div
                  key={m.usuario_id}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white"
                  style={{ backgroundColor: getAvatarColor(m.usuario_id) }}
                  title={`${m.usuario.nome} · ${formatarDataRelativa(m.ativado_em)}`}
                >
                  {getInitials(m.usuario.nome)}
                </div>
              ))}
            </div>
            {totalAtivos > 3 && (
              <span className="ml-2 text-xs text-slate-400">
                +{totalAtivos - 3} mais
              </span>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
