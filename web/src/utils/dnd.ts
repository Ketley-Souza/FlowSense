import type { BoardColumn } from "./kanban";
import type { Tarefa } from "@/types";

export type DragData =
  | { type: "TASK"; tarefaId: string; columnId: string | undefined }
  | { type: "COLUMN"; columnId: string };

// ── Helpers de reordenação ─────────────────────────────────────────────────
export function moveTarefaBetweenColumns(
  columns: BoardColumn[],
  tarefaId: string,
  fromColumnId: string,
  toColumnId: string,
  overTaskId?: string | null
): BoardColumn[] {
  // Nada a fazer se a coluna de origem e destino são iguais e não há posição alvo
  if (fromColumnId === toColumnId && !overTaskId) return columns;

  // Encontrar a tarefa
  let tarefa: Tarefa | undefined;
  const next = columns.map((col) => {
    if (col.id === fromColumnId) {
      tarefa = col.tarefas.find((t) => t.id === tarefaId);
      return { ...col, tarefas: col.tarefas.filter((t) => t.id !== tarefaId) };
    }
    return col;
  });

  if (!tarefa) return columns;

  // Inserir na coluna de destino
  return next.map((col) => {
    if (col.id !== toColumnId) return col;

    const tarefas = [...col.tarefas];

    if (overTaskId && overTaskId !== tarefaId) {
      const overIndex = tarefas.findIndex((t) => t.id === overTaskId);
      if (overIndex !== -1) {
        tarefas.splice(overIndex, 0, tarefa!);
        return { ...col, tarefas };
      }
    }

    return { ...col, tarefas: [...tarefas, tarefa!] };
  });
}

//Extrai o ID da coluna de origem a partir do array de colunas e do ID da tarefa.
export function findColumnIdByTask(
  columns: BoardColumn[],
  tarefaId: string
): string | undefined {
  return columns.find((col) =>
    col.tarefas.some((t) => t.id === tarefaId)
  )?.id;
}
