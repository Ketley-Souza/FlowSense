import { Plus, Trash2 } from "lucide-react";
import type { Tarefa } from "@/types";
import { TaskCard } from "./TaskCard";

type KanbanColumnProps = {
  columnId?: string; // undefined = coluna padrão sem ID real (não pode deletar)
  title: string;
  count: number;
  dotColor: string;
  progressColor: string;
  tarefas: Tarefa[];
  onAddTask: () => void;
  onSelectTask: (tarefa: Tarefa) => void;
  onDeleteColumn?: () => void; // undefined = coluna padrão, sem botão deletar
};

/**
 * Coluna do Kanban
 * - Largura fluida: min(400px, 80vw) — responsiva em mobile sem quebrar o layout
 * - Lista de tarefas com flex-1 para preencher a altura disponível
 * - Botão deletar ancorado ao rodapé via mt-auto (sempre embaixo, longe das tarefas)
 */
export function KanbanColumn({
  title,
  count,
  dotColor,
  progressColor,
  tarefas,
  onAddTask,
  onSelectTask,
  onDeleteColumn,
}: KanbanColumnProps) {
  return (
    <section
      className="shrink-0 rounded-[28px] border border-[#DDE7F3] bg-[#F8FBFF] p-4 flex flex-col"
      style={{ width: "min(400px, 80vw)" }}
    >
      {/* Header da coluna */}
      <header className="mb-4 flex h-10 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
          <h2 className="truncate text-[18px] font-bold text-[#202A3D]">
            {title}{" "}
            <span className="text-[#8EA0B9]">({count})</span>
          </h2>
        </div>

        {/* Botão adicionar tarefa */}
        <button
          type="button"
          onClick={onAddTask}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#C9D5E6] bg-white text-[#42516A] transition hover:border-[#5B35F5] hover:bg-slate-50 hover:text-[#5B35F5]"
          aria-label={`Adicionar tarefa em ${title}`}
          title="Adicionar tarefa"
        >
          <Plus size={22} strokeWidth={1.8} />
        </button>
      </header>

      {/* Lista de tarefas — flex-1 faz preencher o espaço restante */}
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        {tarefas.map((tarefa) => (
          <TaskCard
            key={tarefa.id}
            tarefa={tarefa}
            progressColor={progressColor}
            onClick={() => onSelectTask(tarefa)}
          />
        ))}

        {/* Placeholder quando coluna está vazia */}
        {tarefas.length === 0 && (
          <button
            type="button"
            onClick={onAddTask}
            className="flex h-28 items-center justify-center rounded-[20px] border border-dashed border-[#C9D5E6] bg-white text-sm font-semibold text-[#7E8DA6] transition hover:border-[#5B35F5] hover:text-[#5B35F5]"
          >
            Adicionar tarefa
          </button>
        )}
      </div>

      {/* Rodapé — mt-auto ancora o botão deletar ao fundo, longe das tarefas */}
      {onDeleteColumn && (
        <footer className="mt-auto pt-3 border-t border-[#DDE7F3]">
          <button
            type="button"
            onClick={onDeleteColumn}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold text-[#B0BECF] transition hover:bg-red-50 hover:text-[#FF4F58]"
            aria-label={`Excluir coluna ${title}`}
            title="Excluir esta coluna"
          >
            <Trash2 size={13} />
            Excluir coluna
          </button>
        </footer>
      )}
    </section>
  );
}
