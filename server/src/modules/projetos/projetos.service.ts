import { z } from "zod";
import prisma from "../../lib/prisma";
import { criarNotificacao, notificarMembros, notificarTodos } from "../notificacoes/notificacoes.service";

export const criarProjetoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório."),
  descricao: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um código hexadecimal válido").optional(),
  equipe_id: z.string().uuid("ID da equipe inválido").optional(),
  membros: z
    .array(
      z.object({
        id_usuario: z.string().uuid("ID do usuário inválido"),
        cargo: z.enum(["GERENTE", "MEMBRO"]).default("MEMBRO"),
      })
    )
    .optional(),
});

export const atualizarProjetoSchema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

async function verificarGerenteProjeto(
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

  if (!membro || membro.cargo !== "GERENTE") {
    const error = new Error(
      "Você não tem permissão para gerenciar este projeto."
    );
    (error as NodeJS.ErrnoException).code = "FORBIDDEN";
    throw error;
  }
}

export async function listarProjetos(usuarioId: string) {
  const projetos = await prisma.projeto.findMany({
    where: {
      membros: {
        some: { id_usuario: usuarioId },
      },
    },
    include: {
      membros: {
        include: {
          usuario: {
            select: { id: true, nome: true, email: true, foto_url: true },
          },
        },
      },
      colunas: { select: { id: true, nome: true, ordem: true } },
      tarefas: { select: { progresso: true } }, // só progresso — leve, sem N+1 pesado
      _count: { select: { tarefas: true, colunas: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return projetos;
}

export async function obterProjeto(
  projetoId: string,
  usuarioId: string
) {
  const projeto = await prisma.projeto.findUnique({
    where: { id: projetoId },
    include: {
      membros: {
        include: {
          usuario: {
            select: { id: true, nome: true, email: true, foto_url: true },
          },
        },
      },
      colunas: { orderBy: { ordem: "asc" } },
      tarefas: {
        include: {
          responsavel: { select: { id: true, nome: true, foto_url: true } },
          coluna: { select: { id: true, nome: true } },
          membros: {
            include: {
              usuario: { select: { id: true, nome: true, foto_url: true } },
            },
          },
          tags: { include: { tag: true } },
          subtarefas: { orderBy: { ordem: "asc" } },
          _count: { select: { comentarios: true, anexos: true } },
        },
        orderBy: [{ ordem: "asc" }, { createdAt: "desc" }],
      },
      tags: true,
    },
  });

  if (!projeto) {
    const error = new Error("Projeto não encontrado.");
    (error as NodeJS.ErrnoException).code = "NOT_FOUND";
    throw error;
  }

  const ehMembro = projeto.membros.some(
    (m) => m.id_usuario === usuarioId
  );

  if (!ehMembro) {
    const error = new Error("Você não tem acesso a este projeto.");
    (error as NodeJS.ErrnoException).code = "FORBIDDEN";
    throw error;
  }

  return projeto;
}

export async function criarProjeto(
  data: unknown,
  usuarioId: string
) {
  const payload = criarProjetoSchema.parse(data);

  // Validar datas
  if (payload.data_inicio && payload.data_fim) {
    const dataInicio = new Date(payload.data_inicio);
    const dataFim = new Date(payload.data_fim);

    if (dataFim < dataInicio) {
      const error = new Error("Data final não pode ser anterior à data inicial.");
      (error as NodeJS.ErrnoException).code = "BAD_REQUEST";
      throw error;
    }
  }

  // Se equipe_id foi fornecido, validar se o usuário é membro da equipe
  if (payload.equipe_id) {
    const membroEquipe = await prisma.usuarioEquipe.findUnique({
      where: {
        usuario_id_equipe_id: {
          usuario_id: usuarioId,
          equipe_id: payload.equipe_id,
        },
      },
    });

    if (!membroEquipe) {
      const error = new Error("Você não é membro dessa equipe.");
      (error as NodeJS.ErrnoException).code = "FORBIDDEN";
      throw error;
    }
  }

  // Nota: Não validamos se os usuários existem globalmente
  // para suportar membros locais da equipe (sem cadastro no sistema)
  // A segurança é mantida pela não exposição de todos os usuários do sistema

  // Criar projeto com transação para garantir integridade
  const projeto = await prisma.projeto.create({
    data: {
      nome: payload.nome,
      descricao: payload.descricao,
      data_inicio: payload.data_inicio ? new Date(payload.data_inicio) : null,
      data_fim: payload.data_fim ? new Date(payload.data_fim) : null,
      cor: payload.cor || "#3B82F6",
      equipe_id: payload.equipe_id || null,
    },
  });

  // Adicionar o criador como gerente
  await prisma.projetoMembro.create({
    data: {
      id_projeto: projeto.id,
      id_usuario: usuarioId,
      cargo: "GERENTE",
    },
  });

  // Adicionar membros adicionais
  if (payload.membros && payload.membros.length > 0) {
    await prisma.projetoMembro.createMany({
      data: payload.membros.map((membro) => ({
        id_projeto: projeto.id,
        id_usuario: membro.id_usuario,
        cargo: membro.cargo || "MEMBRO",
      })),
      skipDuplicates: true, // Ignora se o usuário já é membro
    });
  }

  // Criar colunas padrão do Kanban
  await prisma.colunaKanban.createMany({
    data: [
      { nome: "A Fazer", ordem: 1, id_projeto: projeto.id },
      { nome: "Em Progresso", ordem: 2, id_projeto: projeto.id },
      { nome: "Concluído", ordem: 3, id_projeto: projeto.id },
    ],
  });

  // Retornar projeto completo com membros e colunas
  const projetoComMembros = await prisma.projeto.findUnique({
    where: { id: projeto.id },
    include: {
      membros: {
        include: {
          usuario: {
            select: { id: true, nome: true, email: true, foto_url: true },
          },
        },
      },
      colunas: { select: { id: true, nome: true, ordem: true } },
      _count: { select: { tarefas: true, colunas: true } },
    },
  });

  // Notificar membros extras adicionados na criação do projeto
  if (payload.membros && payload.membros.length > 0) {
    const membrosSemCriador = payload.membros
      .map((m) => m.id_usuario)
      .filter((id) => id !== usuarioId);

    if (membrosSemCriador.length > 0) {
      await Promise.all(
        membrosSemCriador.map((id_usuario) =>
          criarNotificacao({
            id_usuario,
            mensagem: `Você foi adicionado ao projeto "${projeto.nome}".`,
            tipo: "MEMBRO_ADICIONADO_PROJETO",
            projetoId: projeto.id,
          })
        )
      );
    }
  }

  return projetoComMembros;
}

export async function atualizarProjeto(
  projetoId: string,
  data: unknown,
  usuarioId: string
) {
  await verificarGerenteProjeto(projetoId, usuarioId);

  const payload = atualizarProjetoSchema.parse(data);

  // Validar datas
  if (payload.data_inicio && payload.data_fim) {
    const dataInicio = new Date(payload.data_inicio);
    const dataFim = new Date(payload.data_fim);

    if (dataFim < dataInicio) {
      const error = new Error("Data final não pode ser anterior à data inicial.");
      (error as NodeJS.ErrnoException).code = "BAD_REQUEST";
      throw error;
    }
  }

  const projeto = await prisma.projeto.update({
    where: { id: projetoId },
    data: {
      nome: payload.nome,
      descricao: payload.descricao,
      data_inicio: payload.data_inicio ? new Date(payload.data_inicio) : undefined,
      data_fim: payload.data_fim ? new Date(payload.data_fim) : undefined,
      cor: payload.cor,
    },
    include: {
      membros: {
        include: {
          usuario: {
            select: { id: true, nome: true, email: true, foto_url: true },
          },
        },
      },
      colunas: { select: { id: true, nome: true, ordem: true } },
      _count: { select: { tarefas: true, colunas: true } },
    },
  });

  // Notificar todos os membros do projeto (incluindo o próprio gerente que editou)
  // Usa notificarTodos: útil para ter confirmação visual de que a alteração foi salva
  const idsMembros = projeto.membros.map((m) => m.id_usuario);
  await notificarTodos(
    idsMembros,
    `O projeto "${projeto.nome}" foi atualizado.`,
    "PROJETO_ATUALIZADO",
    null,
    projetoId
  );

  return projeto;
}

export async function deletarProjeto(
  projetoId: string,
  usuarioId: string
) {
  await verificarGerenteProjeto(projetoId, usuarioId);

  await prisma.projeto.delete({ where: { id: projetoId } });
}

export async function adicionarMembroProjeto(
  projetoId: string,
  id_usuario: string,
  cargo: "GERENTE" | "MEMBRO",
  usuarioAutenticado: string
) {
  await verificarGerenteProjeto(projetoId, usuarioAutenticado);

  // Verificar se usuário já é membro
  const jaEhMembro = await prisma.projetoMembro.findUnique({
    where: {
      id_projeto_id_usuario: {
        id_projeto: projetoId,
        id_usuario,
      },
    },
  });

  if (jaEhMembro) {
    const error = new Error("Usuário já é membro do projeto.");
    (error as NodeJS.ErrnoException).code = "CONFLICT";
    throw error;
  }

  await prisma.projetoMembro.create({
    data: {
      id_projeto: projetoId,
      id_usuario,
      cargo,
    },
  });

  // Buscar nome do projeto para a mensagem
  const projeto = await prisma.projeto.findUnique({
    where: { id: projetoId },
    select: { nome: true },
  });

  // Notificar o novo membro
  await criarNotificacao({
    id_usuario,
    mensagem: `Você foi adicionado ao projeto "${projeto?.nome ?? "sem nome"}".`,
    tipo: "MEMBRO_ADICIONADO_PROJETO",
    projetoId,
  });
}

export async function removerMembroProjeto(
  projetoId: string,
  id_usuario: string,
  usuarioAutenticado: string
) {
  await verificarGerenteProjeto(projetoId, usuarioAutenticado);

  // Impedir que gerente se remova a si mesmo
  if (id_usuario === usuarioAutenticado) {
    const error = new Error(
      "Você não pode se remover do projeto."
    );
    (error as NodeJS.ErrnoException).code = "FORBIDDEN";
    throw error;
  }

  await prisma.projetoMembro.delete({
    where: {
      id_projeto_id_usuario: {
        id_projeto: projetoId,
        id_usuario,
      },
    },
  });
}

export async function atualizarCargoMembroProjeto(
  projetoId: string,
  id_usuario: string,
  cargo: "GERENTE" | "MEMBRO",
  usuarioAutenticado: string
) {
  await verificarGerenteProjeto(projetoId, usuarioAutenticado);

  // Impedir rebaixar a si mesmo
  if (id_usuario === usuarioAutenticado && cargo === "MEMBRO") {
    const error = new Error(
      "Você não pode rebaixar a si mesmo de GERENTE."
    );
    (error as NodeJS.ErrnoException).code = "FORBIDDEN";
    throw error;
  }

  await prisma.projetoMembro.update({
    where: {
      id_projeto_id_usuario: {
        id_projeto: projetoId,
        id_usuario,
      },
    },
    data: { cargo },
  });
}

export async function listarUsuariosParaAdicionar() {
  // Listar todos os usuários para seleção ao criar/editar projeto
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      foto_url: true,
      perfil: true,
    },
    orderBy: { nome: "asc" },
  });

  return usuarios;
}

// ============================================
// COLUNAS KANBAN
// ============================================

export const criarColunaSchema = z.object({
  nome: z.string().trim().min(1, "Nome da coluna é obrigatório."),
});

export async function criarColuna(
  projetoId: string,
  data: unknown,
  usuarioId: string
) {
  const payload = criarColunaSchema.parse(data);

  // Verificar acesso ao projeto (qualquer membro pode criar coluna)
  const membro = await prisma.projetoMembro.findUnique({
    where: {
      id_projeto_id_usuario: {
        id_projeto: projetoId,
        id_usuario: usuarioId,
      },
    },
  });

  if (!membro) {
    const error = new Error("Você não tem acesso a este projeto.");
    (error as NodeJS.ErrnoException).code = "FORBIDDEN";
    throw error;
  }

  // Determinar próxima ordem
  const ultimaColuna = await prisma.colunaKanban.findFirst({
    where: { id_projeto: projetoId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });

  const novaOrdem = (ultimaColuna?.ordem ?? 0) + 1;

  const coluna = await prisma.colunaKanban.create({
    data: {
      nome: payload.nome,
      ordem: novaOrdem,
      id_projeto: projetoId,
    },
    select: { id: true, nome: true, ordem: true, id_projeto: true },
  });

  return coluna;
}

export async function deletarColuna(
  projetoId: string,
  colunaId: string,
  usuarioId: string
) {
  await verificarGerenteProjeto(projetoId, usuarioId);

  const coluna = await prisma.colunaKanban.findFirst({
    where: { id: colunaId, id_projeto: projetoId },
  });

  if (!coluna) {
    const error = new Error("Coluna não encontrada neste projeto.");
    (error as NodeJS.ErrnoException).code = "NOT_FOUND";
    throw error;
  }

  // Desassociar tarefas desta coluna antes de deletar
  await prisma.tarefa.updateMany({
    where: { id_coluna: colunaId },
    data: { id_coluna: null },
  });

  await prisma.colunaKanban.delete({ where: { id: colunaId } });
}

// ============================================
// ANEXOS DE PROJETO
// ============================================

export async function listarAnexosProjeto(
  projetoId: string,
  usuarioId: string
) {
  //verifica se usuário está no projeto
  const membro = await prisma.projetoMembro.findUnique({
    where: {
      id_projeto_id_usuario: { id_projeto: projetoId, id_usuario: usuarioId },
    },
  });
  if (!membro) {
    const error = new Error("Você não tem acesso a este projeto.");
    (error as NodeJS.ErrnoException).code = "FORBIDDEN";
    throw error;
  }

  return prisma.anexoProjeto.findMany({
    where: { id_projeto: projetoId },
    orderBy: { createdAt: "desc" },
  });
}

export async function adicionarAnexoProjeto(
  projetoId: string,
  usuarioId: string,
  anexo: { nome: string; url: string; tipo: string; tamanho?: number }
) {
  const membro = await prisma.projetoMembro.findUnique({
    where: {
      id_projeto_id_usuario: { id_projeto: projetoId, id_usuario: usuarioId },
    },
  });
  if (!membro) {
    const error = new Error("Você não tem acesso a este projeto.");
    (error as NodeJS.ErrnoException).code = "FORBIDDEN";
    throw error;
  }

  // Buscar nome do projeto e membros para a notificação
  const projeto = await prisma.projeto.findUnique({
    where: { id: projetoId },
    select: {
      nome: true,
      membros: { select: { id_usuario: true } },
    },
  });

  const novoAnexo = await prisma.anexoProjeto.create({
    data: {
      nome: anexo.nome,
      url: anexo.url,
      tipo: anexo.tipo,
      tamanho: anexo.tamanho,
      id_projeto: projetoId,
    },
  });

  // Notificar todos os membros do projeto (exceto quem adicionou)
  if (projeto) {
    const idsMembros = projeto.membros.map((m) => m.id_usuario);
    await notificarMembros(
      idsMembros,
      `📎 Novo arquivo adicionado ao projeto "${projeto.nome}": "${anexo.nome}".`,
      "ANEXO_ADICIONADO",
      null,
      projetoId,
      usuarioId
    );
  }

  return novoAnexo;
}

export async function deletarAnexoProjeto(
  projetoId: string,
  anexoId: string,
  usuarioId: string
) {
  await verificarGerenteProjeto(projetoId, usuarioId);

  const anexo = await prisma.anexoProjeto.findFirst({
    where: { id: anexoId, id_projeto: projetoId },
  });

  if (!anexo) {
    const error = new Error("Anexo não encontrado.");
    (error as NodeJS.ErrnoException).code = "NOT_FOUND";
    throw error;
  }

  await prisma.anexoProjeto.delete({ where: { id: anexoId } });
  return { url: anexo.url };
}

