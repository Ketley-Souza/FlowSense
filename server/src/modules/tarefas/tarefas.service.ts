import { Prioridade } from "@prisma/client";
import { z } from "zod";
import prisma from "../../lib/prisma";

export const criarTarefaSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório."),
  descricao: z.string().optional(),
  prioridade: z.nativeEnum(Prioridade).optional(),
  data_inicio: z.string().datetime({ offset: true }).optional(),
  data_fim: z.string().datetime({ offset: true }).optional(),
  prazo: z.string().datetime({ offset: true }).optional(),
  ordem: z.number().int().optional(),
  id_projeto: z.string().uuid("ID de projeto inválido."),
  id_coluna: z.string().uuid("ID de coluna inválido.").optional(),
  id_responsavel: z.string().uuid("ID de responsável inválido.").optional(),
});

export const atualizarTarefaSchema = z.object({
  titulo: z.string().min(1).optional(),
  descricao: z.string().optional(),
  prioridade: z.nativeEnum(Prioridade).optional(),
  progresso: z.number().int().min(0).max(100).optional(),
  data_inicio: z.string().datetime({ offset: true }).optional().nullable(),
  data_fim: z.string().datetime({ offset: true }).optional().nullable(),
  prazo: z.string().datetime({ offset: true }).optional().nullable(),
  ordem: z.number().int().optional(),
  id_coluna: z.string().uuid().optional().nullable(),
  id_responsavel: z.string().uuid().optional(),
});

async function verificarMembroProjeto(
  id_projeto: string,
  usuarioId: string
): Promise<void> {
  const membro = await prisma.projetoMembro.findUnique({
    where: {
      id_projeto_id_usuario: {
        id_projeto,
        id_usuario: usuarioId,
      },
    },
  });

  if (!membro) {
    const error = new Error(
      "Você não tem acesso a este projeto."
    );
    (error as NodeJS.ErrnoException).code = "FORBIDDEN";
    throw error;
  }
}

async function buscarTarefaComAcesso(
  tarefaId: string,
  usuarioId: string
) {
  const tarefa = await prisma.tarefa.findUnique({
    where: { id: tarefaId },
    include: { projeto: { include: { membros: true } } },
  });

  if (!tarefa) {
    const error = new Error("Tarefa não encontrada.");
    (error as NodeJS.ErrnoException).code = "NOT_FOUND";
    throw error;
  }

  const ehMembro = tarefa.projeto.membros.some(
    (m) => m.id_usuario === usuarioId
  );

  if (!ehMembro) {
    const error = new Error("Você não tem acesso a esta tarefa.");
    (error as NodeJS.ErrnoException).code = "FORBIDDEN";
    throw error;
  }

  return tarefa;
}

export async function listarTarefas(usuarioId: string) {
  const tarefas = await prisma.tarefa.findMany({
    where: {
      projeto: {
        membros: {
          some: { id_usuario: usuarioId },
        },
      },
    },
    include: {
      responsavel: {
        select: { id: true, nome: true, foto_url: true },
      },
      coluna: { select: { id: true, nome: true } },
      projeto: { select: { id: true, nome: true } },
      membros: {
        include: {
          usuario: { select: { id: true, nome: true, foto_url: true } },
        },
      },
      tags: { include: { tag: true } },
      subtarefas: { orderBy: { ordem: "asc" } },
      _count: { select: { comentarios: true, anexos: true } },
    },
    orderBy: [{ id_projeto: "asc" }, { ordem: "asc" }, { createdAt: "desc" }],
  });

  return tarefas;
}

export async function criarTarefa(
  data: z.infer<typeof criarTarefaSchema>,
  usuarioId: string
) {
  const payload = criarTarefaSchema.parse(data);

  await verificarMembroProjeto(payload.id_projeto, usuarioId);

  const tarefa = await prisma.tarefa.create({
    data: {
      titulo: payload.titulo,
      descricao: payload.descricao,
      prioridade: payload.prioridade,
      data_inicio: payload.data_inicio ? new Date(payload.data_inicio) : undefined,
      data_fim: payload.data_fim ? new Date(payload.data_fim) : undefined,
      prazo: payload.prazo ? new Date(payload.prazo) : undefined,
      ordem: payload.ordem ?? 0,
      id_projeto: payload.id_projeto,
      id_coluna: payload.id_coluna,
      id_responsavel: payload.id_responsavel ?? usuarioId,
    },
    include: {
      responsavel: { select: { id: true, nome: true, foto_url: true } },
      coluna: { select: { id: true, nome: true } },
      projeto: { select: { id: true, nome: true } },
    },
  });

  return tarefa;
}

export async function atualizarTarefa(
  tarefaId: string,
  data: z.infer<typeof atualizarTarefaSchema>,
  usuarioId: string
) {
  const payload = atualizarTarefaSchema.parse(data);

  await buscarTarefaComAcesso(tarefaId, usuarioId);

  const tarefa = await prisma.tarefa.update({
    where: { id: tarefaId },
    data: {
      ...payload,
      data_inicio: payload.data_inicio
        ? new Date(payload.data_inicio)
        : payload.data_inicio === null
          ? null
          : undefined,
      data_fim: payload.data_fim
        ? new Date(payload.data_fim)
        : payload.data_fim === null
          ? null
          : undefined,
      prazo: payload.prazo
        ? new Date(payload.prazo)
        : payload.prazo === null
          ? null
          : undefined,
    },
    include: {
      responsavel: { select: { id: true, nome: true, foto_url: true } },
      coluna: { select: { id: true, nome: true } },
      projeto: { select: { id: true, nome: true } },
    },
  });

  return tarefa;
}

export async function deletarTarefa(
  tarefaId: string,
  usuarioId: string,
  perfil: string
) {
  const tarefa = await buscarTarefaComAcesso(tarefaId, usuarioId);

  const ehResponsavel = tarefa.id_responsavel === usuarioId;
  const ehAdmin = perfil === "ADMIN";

  if (!ehResponsavel && !ehAdmin) {
    const error = new Error(
      "Apenas o responsável pela tarefa ou um administrador pode deletá-la."
    );
    (error as NodeJS.ErrnoException).code = "FORBIDDEN";
    throw error;
  }

  await prisma.tarefa.delete({ where: { id: tarefaId } });
}
