
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ReactNode } from "react";
import type { BoardColumn } from "@/utils/kanban";
import type { Tarefa } from "@/types";
import { KanbanColumn } from "./KanbanColumn";

type DroppableColumnProps = {
  column: BoardColumn;
  tarefas: Tarefa[];
  onAddTask: () => void;
  onSelectTask: (tarefa: Tarefa) => void;
  onDeleteColumn?: () => void;
  children: ReactNode;
};

export function DroppableColumn({
  column,
  tarefas,
  onAddTask,
  onSelectTask,
  onDeleteColumn,
  children,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "COLUMN",
      columnId: column.formColumnId,
    },
    // Colunas sem ID real (geradas automaticamente) não aceitam drop
    disabled: !column.formColumnId,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        // Feedback visual sutil: outline azul quando um card está sobre a coluna
        outline: isOver ? "2px solid #5B35F5" : "2px solid transparent",
        outlineOffset: "-2px",
        borderRadius: "28px",
        transition: "outline 150ms ease",
      }}
    >
      <KanbanColumn
        columnId={column.formColumnId}
        title={column.title}
        count={tarefas.length}
        dotColor={column.dotColor}
        progressColor={column.progressColor}
        tarefas={tarefas}
        onAddTask={onAddTask}
        onSelectTask={onSelectTask}
        onDeleteColumn={onDeleteColumn}
      >
        <SortableContext
          items={tarefas.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {children}
        </SortableContext>
      </KanbanColumn>
    </div>
  );
}
