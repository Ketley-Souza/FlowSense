import type { DashboardAtividade } from "@/types";

interface ActivityFeedProps {
  atividades: DashboardAtividade[];
}

function getInitials(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function descreveAtividade(campo: string) {
  const mapa: Record<string, string> = {
    prioridade: "alterou a prioridade de",
    progresso: "atualizou o progresso de",
    id_coluna: "moveu",
    titulo: "renomeou",
    descricao: "editou a descrição de",
    data_fim: "alterou o prazo de",
  };
  return mapa[campo] ?? "modificou";
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityFeed({ atividades }: ActivityFeedProps) {
  if (!atividades.length) return null;

  return (
    <div className="space-y-3">
      {atividades.map((a) => (
        <div key={a.id} className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{
              backgroundColor: `hsl(${a.usuario.id.charCodeAt(0) * 17 % 360}, 65%, 55%)`,
            }}
          >
            {getInitials(a.usuario.nome)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">{a.usuario.nome}</span>
              {" "}{descreveAtividade(a.campo_alterado)}{" "}
              <span className="font-medium text-slate-900">{a.tarefa.titulo}</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatTimestamp(a.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
