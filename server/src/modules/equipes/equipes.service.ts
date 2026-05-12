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

export async function obterTokenAtivacao(tokenPlain: string): Promise<any> {
  const tokenHash = crypto.createHash("sha256").update(tokenPlain).digest("hex");

  const token = await prisma.tokenAtivacao.findUnique({
    where: { token: tokenHash },
    include: {
      usuario: { select: { id: true, nome: true, email: true } },
      equipe: { select: { id: true, nome: true } },
    },
  });

  if (!token) {
    const error = new Error("Token inválido");
    (error as any).code = "NOT_FOUND";
    throw error;
  }

  if (token.utilizado) {
    const error = new Error("Token já foi utilizado");
    (error as any).code = "CONFLICT";
    throw error;
  }

  if (new Date() > token.expira_em) {
    const error = new Error("Token expirado");
    (error as any).code = "CONFLICT";
    throw error;
  }

  return token;
}

export async function ativarConta(
  tokenPlain: string,
  novoLogin: string,
  novaSenha: string
): Promise<{ mensagem: string; token: string }> {
  const token = await obterTokenAtivacao(tokenPlain);

  // Atualizar usuário
  const usuario = await prisma.usuario.update({
    where: { id: token.usuario_id },
    data: {
      status: "ATIVO",
      login: novoLogin,
      senha: novaSenha, // Em produção, fazer hash bcrypt
    },
  });

  // Atualizar UsuarioEquipe
  await prisma.usuarioEquipe.update({
    where: {
      usuario_id_equipe_id: {
        usuario_id: token.usuario_id,
        equipe_id: token.equipe_id,
      },
    },
    data: {
      status: "ATIVO",
      ativado_em: new Date(),
    },
  });

  // Marcar token como utilizado
  await prisma.tokenAtivacao.update({
    where: { id: token.id },
    data: {
      utilizado: true,
      utilizado_em: new Date(),
    },
  });

  // Gerar JWT (simular - em produção usar jwt library)
  const jwtToken = Buffer.from(
    JSON.stringify({ sub: usuario.id, email: usuario.email })
  ).toString("base64");

  return {
    mensagem: "Conta ativada com sucesso!",
    token: jwtToken,
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
