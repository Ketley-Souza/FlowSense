import { z } from "zod";
import prisma from "../../lib/prisma";
import crypto from "crypto";
import { enviarEmailConvite } from "../../lib/mailer";

// Schemas de validação
export const criarEquipeSchema = z.object({
  nome: z.string().min(1, "Nome da equipe é obrigatório"),
  descricao: z.string().optional(),
});

export const convidarMembroSchema = z.object({
  email: z.string().email("Email inválido"),
  nome: z.string().min(1, "Nome é obrigatório"),
  cargo: z.enum(["GERENTE", "MEMBRO"]).default("MEMBRO"),
});

export type CriarEquipeInput = z.infer<typeof criarEquipeSchema>;
export type ConvidarMembroInput = z.infer<typeof convidarMembroSchema>;

// Serviço de equipes
export async function criarEquipe(
  usuarioId: string,
  data: CriarEquipeInput
): Promise<any> {
  const equipe = await prisma.equipe.create({
    data: {
      nome: data.nome,
      descricao: data.descricao,
      dono_id: usuarioId,
      usuarios: {
        create: {
          usuario_id: usuarioId,
          cargo: "ADMIN",
          status: "ATIVO",
          ativado_em: new Date(),
        },
      },
    },
    include: {
      usuarios: {
        include: {
          usuario: {
            select: { id: true, nome: true, email: true, login: true },
          },
        },
      },
    },
  });

  return equipe;
}

export async function listarEquipesDoUsuario(usuarioId: string): Promise<any> {
  const equipes = await prisma.usuarioEquipe.findMany({
    where: {
      usuario_id: usuarioId,
      status: { in: ["ATIVO", "PENDENTE"] },
    },
    include: {
      equipe: {
        include: {
          usuarios: {
            include: {
              usuario: {
                select: { id: true, nome: true, email: true, login: true },
              },
            },
          },
        },
      },
    },
  });

  return equipes.map((ue) => ue.equipe);
}

export async function convidarMembro(
  usuarioId: string,
  equipeId: string,
  data: ConvidarMembroInput
): Promise<{ mensagem: string; tokenId: string }> {
  // Verificar se usuário é admin/gerente da equipe
  const usuarioEquipe = await prisma.usuarioEquipe.findUnique({
    where: {
      usuario_id_equipe_id: {
        usuario_id: usuarioId,
        equipe_id: equipeId,
      },
    },
  });

  if (!usuarioEquipe || !["ADMIN", "GERENTE"].includes(usuarioEquipe.cargo)) {
    const error = new Error(
      "Você não tem permissão para convidar membros para essa equipe"
    );
    (error as any).code = "FORBIDDEN";
    throw error;
  }

  // Verificar se email já existe no sistema
  let usuario = await prisma.usuario.findUnique({
    where: { email: data.email },
  });

  // Se não existe, criar usuário com status PENDENTE
  if (!usuario) {
    usuario = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        login: data.email.split("@")[0] + Math.random().toString(36).slice(2, 7),
        senha: "", // Será preenchido na ativação
        status: "PENDENTE",
      },
    });
  }

  // Verificar se usuário já está na equipe
  const jaExiste = await prisma.usuarioEquipe.findUnique({
    where: {
      usuario_id_equipe_id: {
        usuario_id: usuario.id,
        equipe_id: equipeId,
      },
    },
  });

  if (jaExiste) {
    const error = new Error("Usuário já está na equipe");
    (error as any).code = "CONFLICT";
    throw error;
  }

  // Criar UsuarioEquipe com status PENDENTE
  const usuarioEquipeNovo = await prisma.usuarioEquipe.create({
    data: {
      usuario_id: usuario.id,
      equipe_id: equipeId,
      cargo: data.cargo,
      status: "PENDENTE",
    },
  });

  // Gerar token de ativação
  const token = crypto.randomBytes(32).toString("hex");
  const equipe = await prisma.equipe.findUnique({
    where: { id: equipeId },
  });

  if (!equipe) {
    const error = new Error("Equipe não encontrada");
    (error as any).code = "NOT_FOUND";
    throw error;
  }

  const tokenDoc = await prisma.tokenAtivacao.create({
    data: {
      usuario_id: usuario.id,
      equipe_id: equipeId,
      token: crypto.createHash("sha256").update(token).digest("hex"),
      tipo: "CONVITE_EQUIPE",
      expira_em: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    },
  });

  // Enviar email de convite
  try {
    await enviarEmailConvite(
      data.email,
      data.nome,
      equipe.nome,
      token,
      process.env.FRONTEND_URL
    );
  } catch (emailError) {
    console.error("Erro ao enviar email:", emailError);
    // Não falhar se o email não for enviado, apenas registrar o erro
  }

  return {
    mensagem: `Convite enviado para ${data.email}`,
    tokenId: tokenDoc.id,
  };
}




export async function listarMembrosEquipe(
  equipeId: string,
  usuarioId: string
): Promise<any> {
  // Verificar se usuário é membro da equipe
  const usuarioEquipe = await prisma.usuarioEquipe.findUnique({
    where: {
      usuario_id_equipe_id: {
        usuario_id: usuarioId,
        equipe_id: equipeId,
      },
    },
  });

  if (!usuarioEquipe) {
    const error = new Error("Você não é membro dessa equipe");
    (error as any).code = "FORBIDDEN";
    throw error;
  }

  const membros = await prisma.usuarioEquipe.findMany({
    where: {
      equipe_id: equipeId,
      status: {
        in: ["ATIVO", "PENDENTE"],
      },
    },
    include: {
      usuario: {
        select: { id: true, nome: true, email: true, login: true, foto_url: true },
      },
    },
  });

  return membros;
}

export async function atualizarEquipe(
  usuarioId: string,
  equipeId: string,
  data: { nome?: string; descricao?: string }
): Promise<any> {
  // Verificar se usuário é dono da equipe
  const equipe = await prisma.equipe.findUnique({
    where: { id: equipeId },
  });

  if (!equipe) {
    const error = new Error("Equipe não encontrada");
    (error as any).code = "NOT_FOUND";
    throw error;
  }

  if (equipe.dono_id !== usuarioId) {
    const error = new Error("Apenas o dono pode editar a equipe");
    (error as any).code = "FORBIDDEN";
    throw error;
  }

  return prisma.equipe.update({
    where: { id: equipeId },
    data: {
      nome: data.nome || equipe.nome,
      descricao: data.descricao !== undefined ? data.descricao : equipe.descricao,
    },
    include: {
      usuarios: {
        include: {
          usuario: {
            select: { id: true, nome: true, email: true, login: true, foto_url: true },
          },
        },
      },
    },
  });
}

export async function deletarEquipe(
  usuarioId: string,
  equipeId: string
): Promise<void> {
  // Verificar se usuário é dono da equipe
  const equipe = await prisma.equipe.findUnique({
    where: { id: equipeId },
  });

  if (!equipe) {
    const error = new Error("Equipe não encontrada");
    (error as any).code = "NOT_FOUND";
    throw error;
  }

  if (equipe.dono_id !== usuarioId) {
    const error = new Error("Apenas o dono pode deletar a equipe");
    (error as any).code = "FORBIDDEN";
    throw error;
  }

  // Não permitir deletar equipes pessoais
  if (equipe.eh_pessoal) {
    const error = new Error("Não é possível deletar sua equipe pessoal");
    (error as any).code = "FORBIDDEN";
    throw error;
  }

  // Deletar em cascata (projetos, membros, etc)
  await prisma.equipe.delete({
    where: { id: equipeId },
  });
}

export async function listarMembrosDisponiveis(
  usuarioId: string
): Promise<any> {
  // Buscar todas as equipes do usuário
  const usuarioEquipes = await prisma.usuarioEquipe.findMany({
    where: { usuario_id: usuarioId },
    include: {
      equipe: {
        include: {
          usuarios: {
            where: { status: "ATIVO" },
            include: {
              usuario: {
                select: { id: true, nome: true, email: true, login: true, foto_url: true },
              },
            },
          },
        },
      },
    },
  });

  // Extrair membros únicos de todas as equipes
  const membrosMap = new Map();

  for (const ue of usuarioEquipes) {
    for (const membroEquipe of ue.equipe.usuarios) {
      if (membroEquipe.usuario_id !== usuarioId) {
        // Não incluir o próprio usuário
        const chave = membroEquipe.usuario_id;
        if (!membrosMap.has(chave)) {
          membrosMap.set(chave, membroEquipe.usuario);
        }
      }
    }
  }

  return Array.from(membrosMap.values());
}

