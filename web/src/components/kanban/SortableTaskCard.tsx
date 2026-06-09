import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Tarefa } from "@/types";
import { TaskCard } from "./TaskCard";

type SortableTaskCardProps = {
  tarefa: Tarefa;
  progressColor: string;
  onClick: () => void;
};

export function SortableTaskCard({ tarefa, progressColor, onClick }: SortableTaskCardProps) {
  const sortableData = useMemo(
    () => ({
      type: "TASK" as const,
      tarefaId: tarefa.id,
      columnId: tarefa.coluna?.id,
    }),
    [tarefa.id, tarefa.coluna?.id]
  );

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tarefa.id,
    data: sortableData,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 200ms ease",
    opacity: isDragging ? 0 : 1,
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard tarefa={tarefa} progressColor={progressColor} onClick={onClick} />
    </div>
  );
}
