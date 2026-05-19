import {
  CalendarDays,
  CheckCircle2,
  MessageCircle,
  Tag,
} from "lucide-react";
import type { Tarefa } from "@/types";
import { AvatarStack } from "./AvatarStack";
import {
  calcularProgressoTarefa,
  formatarDataBR,
  obterNomesResponsaveis,
} from "@/utils/kanban";

const prioridadeClasses = {
  BAIXA: "bg-[#EEF1FF] text-[#5147F5]",
  MEDIA: "bg-[#FFF9E8] text-[#F5A400]",
  ALTA: "bg-[#FFF1F2] text-[#FF4F58]",
};

const prioridadeLabels = {
  BAIXA: "Sem urgência",
  MEDIA: "Importante",
  ALTA: "Alta Prioridade",
};

type TaskCardProps = {
  tarefa: Tarefa;
  progressColor: string;
  onClick: () => void;
};

/**
 * Card de tarefa exibido no Kanban
 * Mostra: prioridade, título, progresso (por subtarefas), responsáveis, comentários e subtarefas
 */
export function TaskCard({ tarefa, progressColor, onClick }: TaskCardProps) {
  const progresso = calcularProgressoTarefa(tarefa);
  const isDone = progresso >= 100;
  const nomes = obterNomesResponsaveis(tarefa);
  const comentarios = tarefa._count?.comentarios ?? 0;
  const subtarefasConcluidas = tarefa.subtarefas?.filter((s) => s.concluida).length ?? 0;
  const totalSubtarefas = tarefa.subtarefas?.length ?? 0;
  const tags = tarefa.tags ?? [];

  // Datas corretas: data_inicio / data_fim / prazo — não createdAt
  const dataInicio = tarefa.data_inicio ?? tarefa.prazo ?? tarefa.createdAt;
  const dataFim = tarefa.data_fim ?? tarefa.prazo;

  return (
    <article
      onClick={onClick}
      className="h-auto cursor-pointer rounded-[20px] border border-[#E2E9F3] bg-white px-3 py-3 shadow-[0_7px_18px_rgba(31,42,61,0.10),0_1px_2px_rgba(31,42,61,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(31,42,61,0.14)]"
    >
      {/* Badge de Prioridade */}
      <div className="mb-3 inline-flex h-6 items-center text-xs font-medium leading-none">
        <span
          className={[
            "rounded-full px-2 py-1",
            prioridadeClasses[tarefa.prioridade],
          ].join(" ")}
        >
          {prioridadeLabels[tarefa.prioridade]}
        </span>
      </div>

      {/* Título */}
      <h3 className="line-clamp-2 min-h-[44px] text-base font-bold leading-[1.35] text-[#202A3D]">
        {tarefa.titulo}
      </h3>

      {/* Tags (se houver) */}
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tarefaTag) => (
            <div
              key={tarefaTag.tag.id}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold text-white"
              style={{ backgroundColor: tarefaTag.tag.cor }}
            >
              <Tag size={10} />
              {tarefaTag.tag.nome}
            </div>
          ))}
          {tags.length > 3 && (
            <span className="text-xs font-semibold text-[#7E8DA6]">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Barra de Progresso */}
      <div className="mt-3 flex items-center justify-between text-base">
        <span className="font-medium text-[#40506A]">Progresso</span>
        <span className="text-sm font-bold text-[#202A3D]">
          {isDone ? "Concluído" : `${progresso}%`}
        </span>
      </div>

      <div className="mt-2 h-[7px] overflow-hidden rounded-full bg-[#DEE6F1]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progresso === 0 ? 2 : progresso}%`,
            backgroundColor: progressColor,
          }}
        />
      </div>

      {/* Informações de Data */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[#40506A]">
        <CalendarDays size={14} className="shrink-0 text-[#4A5A74]" />
        <span>{formatarDataBR(dataInicio)}</span>
        {dataFim && dataFim !== dataInicio && (
          <>
            <span className="text-[#C9D3E1]">→</span>
            <span>{formatarDataBR(dataFim)}</span>
          </>
        )}
      </div>

      {/* Rodapé: Avatares, Comentários e Subtarefas */}
      <div className="mt-4 flex items-center justify-between">
        <AvatarStack names={nomes.length > 0 ? nomes : ["?"]} />

        <div className="flex items-center gap-4 text-base font-bold text-[#202A3D]">
          {comentarios > 0 && (
            <span className="inline-flex items-center gap-1">
              <MessageCircle size={17} fill="#91A3BE" stroke="none" />
              {comentarios}
            </span>
          )}

          {totalSubtarefas > 0 && (
            <span className="inline-flex items-center gap-1">
              <CheckCircle2
                size={17}
                fill={subtarefasConcluidas === totalSubtarefas ? progressColor : "#91A3BE"}
                className="text-white"
              />
              {subtarefasConcluidas}/{totalSubtarefas}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
