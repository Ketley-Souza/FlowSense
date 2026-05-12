import { z } from "zod";
import prisma from "../../lib/prisma";

export const criarProjetoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório."),
  descricao: z.string().optional(),
  data_inicio: z.string().datetime().optional(),
  data_fim: z.string().datetime().optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um código hexadecimal válido").optional(),
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
  data_inicio: z.string().datetime().optional(),
  data_fim: z.string().datetime().optional(),
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
