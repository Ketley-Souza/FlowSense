import { Prisma, Prioridade } from "@prisma/client";
import { z } from "zod";
import prisma from "../../lib/prisma";

const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um codigo hexadecimal valido.");

const dataOpcionalSchema = z.string().datetime({ offset: true }).nullable().optional();

const subtarefaSchema = z.object({
  id: z.string().uuid("ID de subtarefa invalido.").optional(),
  titulo: z.string().trim().min(1, "Titulo da subtarefa e obrigatorio."),
  concluida: z.boolean().optional(),
  ordem: z.number().int().min(0).optional(),
});

const tagSchema = z.object({
  id: z.string().uuid("ID de tag invalido.").optional(),
  nome: z.string().trim().min(1, "Nome da tag e obrigatorio."),
  cor: hexColorSchema.optional(),
});

export const criarTarefaSchema = z.object({
  titulo: z.string().trim().min(1, "Titulo e obrigatorio."),
  descricao: z.string().trim().nullable().optional(),
  prioridade: z.nativeEnum(Prioridade).optional(),
  data_inicio: dataOpcionalSchema,
  data_fim: dataOpcionalSchema,
  prazo: dataOpcionalSchema,
  ordem: z.number().int().min(0).optional(),
  id_projeto: z.string().uuid("ID de projeto invalido."),
  id_coluna: z.string().uuid("ID de coluna invalido.").nullable().optional(),
  id_responsavel: z.string().uuid("ID de responsavel invalido.").optional(),
  id_membros: z.array(z.string().uuid("ID de membro invalido.")).optional(),
  subtarefas: z.array(subtarefaSchema.omit({ id: true })).optional(),
  tags: z.array(tagSchema).optional(),
});

export const atualizarTarefaSchema = z.object({
  titulo: z.string().trim().min(1).optional(),
  descricao: z.string().trim().nullable().optional(),
  prioridade: z.nativeEnum(Prioridade).optional(),
  progresso: z.number().int().min(0).max(100).optional(),
  data_inicio: dataOpcionalSchema,
  data_fim: dataOpcionalSchema,
  prazo: dataOpcionalSchema,
  ordem: z.number().int().min(0).optional(),
  id_coluna: z.string().uuid().nullable().optional(),
  id_responsavel: z.string().uuid().optional(),
  id_membros: z.array(z.string().uuid("ID de membro invalido.")).optional(),
  subtarefas: z.array(subtarefaSchema).optional(),
  tags: z.array(tagSchema).optional(),
});

export const criarComentarioSchema = z.object({
  texto: z.string().trim().min(1, "Comentario e obrigatorio."),
});

export const criarAnexoSchema = z.object({
  nome: z.string().trim().min(1, "Nome do anexo e obrigatorio."),
  url: z.string().trim().min(1, "URL do anexo e obrigatoria."),
  tipo: z.string().trim().min(1).optional(),
});

const tarefaCompletaInclude = {
  responsavel: {
    select: { id: true, nome: true, email: true, foto_url: true },
  },
  coluna: { select: { id: true, nome: true, ordem: true, id_projeto: true } },
  projeto: {
    select: {
      id: true,
      nome: true,
      descricao: true,
      data_inicio: true,
      data_fim: true,
      cor: true,
      equipe_id: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  membros: {
    include: {
      usuario: {
        select: { id: true, nome: true, email: true, foto_url: true },
      },
    },
    orderBy: { createdAt: "asc" },
  },
  tags: {
    include: { tag: true },
    orderBy: { createdAt: "asc" },
  },
  subtarefas: { orderBy: { ordem: "asc" } },
  anexos: { orderBy: { createdAt: "desc" } },
  comentarios: {
    include: {
      usuario: {
        select: { id: true, nome: true, email: true, foto_url: true },
      },
    },
    orderBy: { createdAt: "asc" },
  },
  historicos: {
    include: {
      usuario: {
        select: { id: true, nome: true, email: true, foto_url: true },
      },
    },
    orderBy: { createdAt: "desc" },
  },
  _count: { select: { comentarios: true, anexos: true } },
} satisfies Prisma.TarefaInclude;

const tagColors = [
  "#5147F5",
  "#00B87A",
  "#FF4F58",
  "#F59E0B",
  "#0EA5E9",
  "#8B5CF6",
];

function criarErro(message: string, code: string): Error {
  const error = new Error(message);
  (error as NodeJS.ErrnoException).code = code;
  return error;
}

function normalizarTexto(value?: string | null): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const texto = value.trim();
  return texto.length > 0 ? texto : null;
}

function converterData(
  value?: string | null,
  permitirNull = false
): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return permitirNull ? null : undefined;
  return new Date(value);
}

function idsUnicos(ids: string[] = []): string[] {
  return Array.from(new Set(ids.filter(Boolean)));
}

function calcularProgressoPorSubtarefas(
  subtarefas?: Array<{ concluida?: boolean }>,
  fallback = 0
): number {
  if (!subtarefas || subtarefas.length === 0) {
    return fallback;
  }

  const concluidas = subtarefas.filter((subtarefa) => subtarefa.concluida).length;
  return Math.round((concluidas / subtarefas.length) * 100);
}

function corTagPadrao(nome: string): string {
  const hash = nome.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return tagColors[hash % tagColors.length];
}

function valorHistorico(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

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
    throw criarErro("Voce nao tem acesso a este projeto.", "FORBIDDEN");
  }
}

async function buscarTarefaComAcesso(tarefaId: string, usuarioId: string) {
  const tarefa = await prisma.tarefa.findUnique({
    where: { id: tarefaId },
    include: { projeto: { include: { membros: true } } },
  });

  if (!tarefa) {
    throw criarErro("Tarefa nao encontrada.", "NOT_FOUND");
  }

  const ehMembro = tarefa.projeto.membros.some(
    (membro) => membro.id_usuario === usuarioId
  );

  if (!ehMembro) {
    throw criarErro("Voce nao tem acesso a esta tarefa.", "FORBIDDEN");
  }

  return tarefa;
}

async function buscarTarefaCompleta(tarefaId: string) {
  const tarefa = await prisma.tarefa.findUnique({
    where: { id: tarefaId },
    include: tarefaCompletaInclude,
  });

  if (!tarefa) {
    throw criarErro("Tarefa nao encontrada.", "NOT_FOUND");
  }

  return tarefa;
}

async function validarColunaProjeto(
  id_coluna: string | null | undefined,
  id_projeto: string
): Promise<void> {
  if (!id_coluna) return;

  const coluna = await prisma.colunaKanban.findFirst({
    where: { id: id_coluna, id_projeto },
    select: { id: true },
  });

  if (!coluna) {
    throw criarErro("A coluna informada nao pertence ao projeto.", "BAD_REQUEST");
  }
}

async function validarUsuariosDoProjeto(
  id_projeto: string,
  idsUsuarios: string[]
): Promise<void> {
  const ids = idsUnicos(idsUsuarios);
  if (ids.length === 0) return;

  const membros = await prisma.projetoMembro.findMany({
    where: {
      id_projeto,
      id_usuario: { in: ids },
    },
    select: { id_usuario: true },
  });

  const idsValidos = new Set(membros.map((membro) => membro.id_usuario));
  const idsInvalidos = ids.filter((id) => !idsValidos.has(id));

  if (idsInvalidos.length > 0) {
    throw criarErro(
      "Todos os responsaveis precisam ser membros do projeto.",
      "BAD_REQUEST"
    );
  }
}

async function registrarHistorico(
  tx: Prisma.TransactionClient,
  id_tarefa: string,
  id_usuario: string,
  campo_alterado: string,
  valor_antigo?: unknown,
  valor_novo?: unknown
) {
  await tx.historicoTarefa.create({
    data: {
      id_tarefa,
      id_usuario,
      campo_alterado,
      valor_antigo: valorHistorico(valor_antigo),
      valor_novo: valorHistorico(valor_novo),
    },
  });
}

async function sincronizarMembros(
  tx: Prisma.TransactionClient,
  id_tarefa: string,
  idsUsuarios: string[]
) {
  const ids = idsUnicos(idsUsuarios);

  await tx.tarefaMembro.deleteMany({ where: { id_tarefa } });

  if (ids.length === 0) return;

  await tx.tarefaMembro.createMany({
    data: ids.map((id_usuario) => ({ id_tarefa, id_usuario })),
    skipDuplicates: true,
  });
}

async function garantirMembroTarefa(
  tx: Prisma.TransactionClient,
  id_tarefa: string,
  id_usuario: string
) {
  await tx.tarefaMembro.upsert({
    where: {
      id_tarefa_id_usuario: {
        id_tarefa,
        id_usuario,
      },
    },
    update: {},
    create: {
      id_tarefa,
      id_usuario,
    },
  });
}

async function sincronizarSubtarefas(
  tx: Prisma.TransactionClient,
  id_tarefa: string,
  subtarefas: z.infer<typeof subtarefaSchema>[]
) {
  const idsExistentes = subtarefas
    .map((subtarefa) => subtarefa.id)
    .filter((id): id is string => Boolean(id));

  if (idsExistentes.length > 0) {
    const existentes = await tx.subtarefa.findMany({
      where: { id_tarefa, id: { in: idsExistentes } },
      select: { id: true },
    });
    const idsValidos = new Set(existentes.map((subtarefa) => subtarefa.id));
    const idsInvalidos = idsExistentes.filter((id) => !idsValidos.has(id));

    if (idsInvalidos.length > 0) {
      throw criarErro("Uma ou mais subtarefas nao pertencem a tarefa.", "BAD_REQUEST");
    }
  }

  await tx.subtarefa.deleteMany({
    where: {
      id_tarefa,
      ...(idsExistentes.length > 0 ? { id: { notIn: idsExistentes } } : {}),
    },
  });

  await Promise.all(
    subtarefas.map((subtarefa, index) => {
      const data = {
        titulo: subtarefa.titulo,
        concluida: subtarefa.concluida ?? false,
        ordem: subtarefa.ordem ?? index,
      };

      if (subtarefa.id) {
        return tx.subtarefa.update({
          where: { id: subtarefa.id },
          data,
        });
      }

      return tx.subtarefa.create({
        data: {
          ...data,
          id_tarefa,
        },
      });
    })
  );
}

async function sincronizarTags(
  tx: Prisma.TransactionClient,
  id_tarefa: string,
  id_projeto: string,
  tags: z.infer<typeof tagSchema>[]
) {
  const tagsUnicas = Array.from(
    new Map(tags.map((tag) => [tag.nome.toLowerCase(), tag])).values()
  );

  await tx.tarefaTag.deleteMany({ where: { id_tarefa } });

  for (const tagInput of tagsUnicas) {
    const tag = tagInput.id
      ? await tx.tag.findFirst({
          where: { id: tagInput.id, id_projeto },
        })
      : await tx.tag.upsert({
          where: {
            id_projeto_nome: {
              id_projeto,
              nome: tagInput.nome,
            },
          },
          update: {
            cor: tagInput.cor,
          },
          create: {
            id_projeto,
            nome: tagInput.nome,
            cor: tagInput.cor ?? corTagPadrao(tagInput.nome),
          },
        });

    if (!tag) {
      throw criarErro("Uma ou mais tags nao pertencem ao projeto.", "BAD_REQUEST");
    }

    await tx.tarefaTag.create({
      data: {
        id_tarefa,
        id_tag: tag.id,
      },
    });
  }
}

export async function listarTarefas(usuarioId: string) {
  return prisma.tarefa.findMany({
    where: {
      projeto: {
        membros: {
          some: { id_usuario: usuarioId },
        },
      },
    },
    include: tarefaCompletaInclude,
    orderBy: [{ id_projeto: "asc" }, { ordem: "asc" }, { createdAt: "desc" }],
  });
}

export async function listarTarefasPorProjeto(
  projetoId: string,
  usuarioId: string
) {
  await verificarMembroProjeto(projetoId, usuarioId);

  return prisma.tarefa.findMany({
    where: { id_projeto: projetoId },
    include: tarefaCompletaInclude,
    orderBy: [{ ordem: "asc" }, { createdAt: "desc" }],
  });
}

export async function criarTarefa(data: unknown, usuarioId: string) {
  const payload = criarTarefaSchema.parse(data);

  await verificarMembroProjeto(payload.id_projeto, usuarioId);
  await validarColunaProjeto(payload.id_coluna, payload.id_projeto);

  const idResponsavel = payload.id_responsavel ?? payload.id_membros?.[0] ?? usuarioId;
  const idsMembros = idsUnicos([idResponsavel, ...(payload.id_membros ?? [])]);

  await validarUsuariosDoProjeto(payload.id_projeto, idsMembros);

  const progresso = calcularProgressoPorSubtarefas(payload.subtarefas, 0);

  const tarefa = await prisma.$transaction(async (tx) => {
    const novaTarefa = await tx.tarefa.create({
      data: {
        titulo: payload.titulo,
        descricao: normalizarTexto(payload.descricao),
        prioridade: payload.prioridade ?? "MEDIA",
        progresso,
        data_inicio: converterData(payload.data_inicio),
        data_fim: converterData(payload.data_fim),
        prazo: converterData(payload.prazo),
        ordem: payload.ordem ?? 0,
        id_projeto: payload.id_projeto,
        id_coluna: payload.id_coluna ?? undefined,
        id_responsavel: idResponsavel,
      },
    });

    await sincronizarMembros(tx, novaTarefa.id, idsMembros);

    if (payload.subtarefas) {
      await sincronizarSubtarefas(tx, novaTarefa.id, payload.subtarefas);
    }

    if (payload.tags) {
      await sincronizarTags(tx, novaTarefa.id, payload.id_projeto, payload.tags);
    }

    await registrarHistorico(
      tx,
      novaTarefa.id,
      usuarioId,
      "tarefa",
      null,
      "Tarefa criada"
    );

    return novaTarefa;
  });

  return buscarTarefaCompleta(tarefa.id);
}

export async function atualizarTarefa(
  tarefaId: string,
  data: unknown,
  usuarioId: string
) {
  const payload = atualizarTarefaSchema.parse(data);
  const tarefaAtual = await buscarTarefaComAcesso(tarefaId, usuarioId);

  await validarColunaProjeto(payload.id_coluna, tarefaAtual.id_projeto);

  const idResponsavel = payload.id_responsavel ?? tarefaAtual.id_responsavel;
  const idsMembros =
    payload.id_membros !== undefined
      ? idsUnicos([idResponsavel, ...payload.id_membros])
      : [idResponsavel];

  await validarUsuariosDoProjeto(tarefaAtual.id_projeto, idsMembros);

  const progresso =
    payload.subtarefas !== undefined
      ? calcularProgressoPorSubtarefas(payload.subtarefas, tarefaAtual.progresso)
      : payload.progresso;

  await prisma.$transaction(async (tx) => {
    const tarefaAtualizada = await tx.tarefa.update({
      where: { id: tarefaId },
      data: {
        titulo: payload.titulo,
        descricao:
          payload.descricao === undefined
            ? undefined
            : normalizarTexto(payload.descricao),
        prioridade: payload.prioridade,
        progresso,
        data_inicio: converterData(payload.data_inicio, true),
        data_fim: converterData(payload.data_fim, true),
        prazo: converterData(payload.prazo, true),
        ordem: payload.ordem,
        id_coluna: payload.id_coluna,
        id_responsavel: payload.id_responsavel,
      },
    });

    const historicosEscalares: Array<[string, unknown, unknown]> = [
      ["titulo", tarefaAtual.titulo, tarefaAtualizada.titulo],
      ["descricao", tarefaAtual.descricao, tarefaAtualizada.descricao],
      ["prioridade", tarefaAtual.prioridade, tarefaAtualizada.prioridade],
      ["progresso", tarefaAtual.progresso, tarefaAtualizada.progresso],
      ["data_inicio", tarefaAtual.data_inicio, tarefaAtualizada.data_inicio],
      ["data_fim", tarefaAtual.data_fim, tarefaAtualizada.data_fim],
      ["prazo", tarefaAtual.prazo, tarefaAtualizada.prazo],
      ["id_coluna", tarefaAtual.id_coluna, tarefaAtualizada.id_coluna],
      ["id_responsavel", tarefaAtual.id_responsavel, tarefaAtualizada.id_responsavel],
    ];

    for (const [campo, antigo, novo] of historicosEscalares) {
      if (valorHistorico(antigo) !== valorHistorico(novo)) {
        await registrarHistorico(tx, tarefaId, usuarioId, campo, antigo, novo);
      }
    }

    if (payload.id_membros !== undefined) {
      await sincronizarMembros(tx, tarefaId, idsMembros);
      await registrarHistorico(tx, tarefaId, usuarioId, "membros", null, "Membros atualizados");
    } else if (payload.id_responsavel) {
      await garantirMembroTarefa(tx, tarefaId, payload.id_responsavel);
    }

    if (payload.subtarefas !== undefined) {
      await sincronizarSubtarefas(tx, tarefaId, payload.subtarefas);
      await registrarHistorico(
        tx,
        tarefaId,
        usuarioId,
        "subtarefas",
        null,
        "Subtarefas atualizadas"
      );
    }

    if (payload.tags !== undefined) {
      await sincronizarTags(tx, tarefaId, tarefaAtual.id_projeto, payload.tags);
      await registrarHistorico(tx, tarefaId, usuarioId, "tags", null, "Tags atualizadas");
    }
  });

  return buscarTarefaCompleta(tarefaId);
}

export async function adicionarComentario(
  tarefaId: string,
  data: unknown,
  usuarioId: string
) {
  const payload = criarComentarioSchema.parse(data);

  await buscarTarefaComAcesso(tarefaId, usuarioId);

  await prisma.$transaction(async (tx) => {
    await tx.comentario.create({
      data: {
        texto: payload.texto,
        id_tarefa: tarefaId,
        id_usuario: usuarioId,
      },
    });

    await registrarHistorico(
      tx,
      tarefaId,
      usuarioId,
      "comentario",
      null,
      "Comentario adicionado"
    );
  });

  return buscarTarefaCompleta(tarefaId);
}

export async function adicionarAnexo(
  tarefaId: string,
  data: unknown,
  usuarioId: string
) {
  const payload = criarAnexoSchema.parse(data);

  await buscarTarefaComAcesso(tarefaId, usuarioId);

  await prisma.$transaction(async (tx) => {
    await tx.anexo.create({
      data: {
        nome: payload.nome,
        url: payload.url,
        tipo: payload.tipo ?? "application/octet-stream",
        id_tarefa: tarefaId,
      },
    });

    await registrarHistorico(tx, tarefaId, usuarioId, "anexo", null, payload.nome);
  });

  return buscarTarefaCompleta(tarefaId);
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
    throw criarErro(
      "Apenas o responsavel pela tarefa ou um administrador pode deleta-la.",
      "FORBIDDEN"
    );
  }

  await prisma.tarefa.delete({ where: { id: tarefaId } });
}
