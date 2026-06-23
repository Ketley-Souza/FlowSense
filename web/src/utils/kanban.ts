import type { ColunaKanban, Subtarefa, Tarefa } from "@/types";

/**
 * Paleta de cores para as colunas do Kanban
 * Cada coluna recebe uma cor da paleta ciclicamente
 */
const colorPalette = [
  { dotColor: "#5048F4", progressColor: "#5147F5" },
  { dotColor: "#F6A300", progressColor: "#F6A300" },
  { dotColor: "#00C982", progressColor: "#00C982" },
  { dotColor: "#FF4F58", progressColor: "#FF4F58" },
];

/**
 * Calcula o progresso da tarefa baseado em suas subtarefas
 * Se não há subtarefas, retorna o progresso atual da tarefa
 * Se há subtarefas, calcula: (subtarefas_concluídas / total_subtarefas) * 100
 */
export function calcularProgressoTarefa(tarefa: Tarefa): number {
  if (!tarefa.subtarefas || tarefa.subtarefas.length === 0) {
    return tarefa.progresso;
  }

  const totalSubtarefas = tarefa.subtarefas.length;
  const subtarefasConcluidas = tarefa.subtarefas.filter(
    (sub) => sub.concluida
  ).length;

  return Math.round((subtarefasConcluidas / totalSubtarefas) * 100);
}

/**
 * Normaliza nome de coluna removendo acentos e convertendo para lowercase
 */
function normalizarNomeColuna(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "_");
}

/**
 * Determina a coluna padrão para uma tarefa baseado em seu progresso
 */
function obterColunaParadaoTarefa(tarefa: Tarefa): string {
  const progresso = calcularProgressoTarefa(tarefa);

  if (progresso >= 100) {
    return "concluido";
  }

  if (progresso > 0) {
    return "em_andamento";
  }

  return "a_fazer";
}

/**
 * Tipos para as colunas do board
 */
export type BoardColumn = {
  id: string;
  formColumnId?: string; // ID da coluna real para uso em forms
  title: string;
  dotColor: string;
  progressColor: string;
  tarefas: Tarefa[];
};

export type ProjectColumn = ColunaKanban & {
  ordem?: number;
};

/**
 * Constrói as colunas do Kanban a partir de tarefas e colunas do projeto
 * - Prioriza as colunas do projeto definidas no banco
 * - Agrupa tarefas sem coluna ou com coluna não cadastrada em colunas padrão
 * - Aplica cores da paleta ciclicamente
 */
export function buildBoardColumns(
  tarefas: Tarefa[],
  projectColumns: ProjectColumn[] = []
): BoardColumn[] {
  const columnMap = new Map<string, BoardColumn>();

  // 1. Adicionar colunas do projeto (em ordem)
  projectColumns
    .slice()
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
    .forEach((column, index) => {
      const colors = colorPalette[index % colorPalette.length];

      columnMap.set(column.id, {
        id: column.id,
        formColumnId: column.id, // ID real para forms
        title: column.nome,
        dotColor: colors.dotColor,
        progressColor: colors.progressColor,
        tarefas: [],
      });
    });

  // 2. Agrupar tarefas nas colunas
  tarefas.forEach((tarefa) => {
    const columnId =
      tarefa.coluna?.id ??
      normalizarNomeColuna(obterColunaParadaoTarefa(tarefa));

    const title = tarefa.coluna?.nome ?? obterColunaParadaoTarefa(tarefa);

    // Criar coluna padrão se não existe e não está nas colunas do projeto
    if (!columnMap.has(columnId) && !tarefa.coluna?.id) {
      const index = columnMap.size;
      const colors = colorPalette[index % colorPalette.length];

      columnMap.set(columnId, {
        id: columnId,
        title,
        dotColor: colors.dotColor,
        progressColor: colors.progressColor,
        tarefas: [],
      });
    }

    // Se tem coluna real, adicionar à coluna do projeto
    if (tarefa.coluna?.id) {
      columnMap.get(tarefa.coluna.id)?.tarefas.push(tarefa);
    } else {
      // Caso contrário, adicionar à coluna padrão
      columnMap.get(columnId)?.tarefas.push(tarefa);
    }
  });

  // 3. Se não há colunas, criar as 3 padrões (A Fazer, Em Andamento, Concluído)
  if (columnMap.size === 0) {
    const defaultColumns = [
      { id: "a_fazer", nome: "A Fazer" },
      { id: "em_andamento", nome: "Em Andamento" },
      { id: "concluido", nome: "Concluído" },
    ];

    return defaultColumns.map((col, index) => ({
      id: col.id,
      title: col.nome,
      dotColor: colorPalette[index].dotColor,
      progressColor: colorPalette[index].progressColor,
      tarefas: [],
    }));
  }

  return Array.from(columnMap.values());
}

/**
 * Formata data para formato brasileiro (DD Mmm YYYY)
 * Exemplo: 01 Abr 2026
 */
export function formatarDataBR(dataString?: string): string {
  if (!dataString) return "—";

  const data = new Date(dataString);

  if (Number.isNaN(data.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(data)
    .replace(".", "")
    .replace(",", "");
}

/**
 * Obtém nomes únicos de todos os responsáveis de uma tarefa
 * Inclui: responsável + membros designados
 */
export function obterNomesResponsaveis(tarefa: Tarefa): string[] {
  const nomes = [
    tarefa.responsavel?.nome,
    ...(tarefa.membros?.map((m) => m.usuario?.nome) ?? []),
  ].filter(Boolean) as string[];

  return Array.from(new Set(nomes));
}

/**
 * Obtém lista de membros responsáveis com nome e foto_url
 * Inclui: responsável principal + membros designados, sem duplicatas
 */
export function obterMembrosResponsaveis(
  tarefa: Tarefa
): Array<{ nome: string; foto_url?: string | null }> {
  const vistos = new Set<string>();
  const resultado: Array<{ nome: string; foto_url?: string | null }> = [];

  const adicionar = (nome?: string, foto_url?: string | null) => {
    if (!nome || vistos.has(nome)) return;
    vistos.add(nome);
    resultado.push({ nome, foto_url: foto_url ?? null });
  };

  adicionar(tarefa.responsavel?.nome, tarefa.responsavel?.foto_url);
  tarefa.membros?.forEach((m) =>
    adicionar(m.usuario?.nome, m.usuario?.foto_url)
  );

  return resultado;
}

/**
 * Obtém cor CSS para uma tag baseado no atributo cor
 */
export function obterCorTag(cor?: string): string {
  return cor || "#E5E7EB"; // gray-200 como padrão
}

/**
 * Formata nome para exibir iniciais (ex: "Ana Silva" -> "AS")
 */
export function obterIniciaisNome(nome: string): string {
  return nome
    .split(" ")
    .map((palavra) => palavra.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}
