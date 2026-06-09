import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";

export const criarUsuarioEquipeSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório."),
  email: z.string().email("Email inválido."),
  login: z.string().min(3, "Login deve ter pelo menos 3 caracteres."),
});

export async function criarUsuarioEquipe(data: unknown) {
  const payload = criarUsuarioEquipeSchema.parse(data);

  // Verificar se usuário já existe por email ou login
  const usuarioExistente = await prisma.usuario.findFirst({
    where: {
      OR: [{ email: payload.email }, { login: payload.login }],
    },
  });

  if (usuarioExistente) {
    const error = new Error(
      `Usuário com ${usuarioExistente.email === payload.email ? "este email" : "este login"
      } já existe.`
    );
    (error as NodeJS.ErrnoException).code = "CONFLICT";
    throw error;
  }

  // Criar usuário sem senha (não pode fazer login)
  const usuario = await prisma.usuario.create({
    data: {
      nome: payload.nome,
      email: payload.email,
      login: payload.login,
      senha: "nao-cadastrada", // Placeholder, não pode fazer login
      perfil: "USUARIO",
    },
  });

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    login: usuario.login,
  };
}

export async function listarUsuarios(usuarioId: string) {
  // Retornar apenas usuários que o usuário atual conhece:
  // 1. Usuários nas mesmas equipes
  // 2. Usuários em projetos que o usuário participa

  const usuarioEquipes = await prisma.usuarioEquipe.findMany({
    where: { usuario_id: usuarioId },
    select: { equipe_id: true },
  });

  const equipeIds = usuarioEquipes.map((ue) => ue.equipe_id);

  const usuarioProjetosQuePrticipa = await prisma.projetoMembro.findMany({
    where: { id_usuario: usuarioId },
    select: { id_projeto: true },
  });

  const projetoIds = usuarioProjetosQuePrticipa.map((pm) => pm.id_projeto);

  // Buscar usuários nas mesmas equipes ou projetos
  const usuarios = await prisma.usuario.findMany({
    where: {
      OR: [
        {
          usuarioEquipes: {
            some: {
              equipe_id: { in: equipeIds },
            },
          },
        },
        {
          projetosMembro: {
            some: {
              id_projeto: { in: projetoIds },
            },
          },
        },
      ],
      id: { not: usuarioId }, // Não incluir o próprio usuário
    },
    select: {
      id: true,
      nome: true,
      email: true,
      login: true,
      foto_url: true,
      preferencias: true,
      perfil: true,
    },
  });

  return usuarios;
}

// Versão antiga comentada
/*
export async function listarUsuariosAntigo() {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      login: true,
      foto_url: true,
    },
    orderBy: { nome: "asc" },
  });

  return usuarios;
}
*/

//atualiza pfp do usuário
export async function atualizarAvatar(usuarioId: string, foto_url: string) {
  const usuario = await prisma.usuario.update({
    where: { id: usuarioId },
    data: { foto_url },
    select: {
      id: true,
      nome: true,
      email: true,
      login: true,
      foto_url: true,
      preferencias: true,
      perfil: true,
    },
  });
  return usuario;
}

// ──────────────────────────────────────────────────────────
// Obter perfil completo (inclui preferências)
// ──────────────────────────────────────────────────────────
export async function obterPerfil(usuarioId: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      nome: true,
      email: true,
      login: true,
      foto_url: true,
      perfil: true,
      preferencias: true,
    },
  });

  if (!usuario) {
    const error = new Error("Usuário não encontrado.");
    (error as NodeJS.ErrnoException).code = "NOT_FOUND";
    throw error;
  }

  return usuario;
}

// ──────────────────────────────────────────────────────────
// Alterar senha
// ──────────────────────────────────────────────────────────
export const alterarSenhaSchema = z.object({
  senha_atual: z.string().min(1, "Informe sua senha atual."),
  nova_senha: z
    .string()
    .min(6, "A nova senha deve ter pelo menos 6 caracteres."),
});

export async function alterarSenha(usuarioId: string, data: unknown) {
  const { senha_atual, nova_senha } = alterarSenhaSchema.parse(data);

  // Buscar usuário com a senha hash
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true, senha: true },
  });

  if (!usuario) {
    const error = new Error("Usuário não encontrado.");
    (error as NodeJS.ErrnoException).code = "NOT_FOUND";
    throw error;
  }

  // Verificar senha atual
  const senhaCorreta = await bcrypt.compare(senha_atual, usuario.senha);
  if (!senhaCorreta) {
    const error = new Error("Senha atual incorreta.");
    (error as NodeJS.ErrnoException).code = "UNAUTHORIZED";
    throw error;
  }

  // Hashar e salvar nova senha
  const novaHash = await bcrypt.hash(nova_senha, 10);
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { senha: novaHash },
  });
}

// ──────────────────────────────────────────────────────────
// Preferências de notificação
// ──────────────────────────────────────────────────────────
export const salvarPreferenciasSchema = z.object({
  notif_push: z.boolean().optional(),
  notif_tarefas: z.boolean().optional(),
  notif_comentarios: z.boolean().optional(),
  notif_plataforma: z.boolean().optional(),
});

export async function salvarPreferencias(usuarioId: string, data: unknown) {
  const payload = salvarPreferenciasSchema.parse(data);

  // Buscar preferências atuais para fazer merge
  const atual = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { preferencias: true },
  });

  const preferenciasAtuais =
    (atual?.preferencias as Record<string, unknown> | null) ?? {};

  const mergeadas = { ...preferenciasAtuais, ...payload };

  const usuario = await prisma.usuario.update({
    where: { id: usuarioId },
    data: { preferencias: mergeadas },
    select: { preferencias: true },
  });

  return usuario.preferencias;
}

//atualiza nome e email
export const atualizarPerfilSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres.").optional(),
  email: z.string().email("E-mail inválido.").optional(),
});

export async function atualizarPerfil(usuarioId: string, data: unknown) {
  const payload = atualizarPerfilSchema.parse(data);

  if (payload.email) {
    const existente = await prisma.usuario.findFirst({
      where: { email: payload.email, NOT: { id: usuarioId } },
    });
    if (existente) {
      const error = new Error("E-mail já está em uso.");
      (error as NodeJS.ErrnoException).code = "CONFLICT";
      throw error;
    }
  }

  const usuario = await prisma.usuario.update({
    where: { id: usuarioId },
    data: payload,
    select: {
      id: true,
      nome: true,
      email: true,
      login: true,
      foto_url: true,
      preferencias: true,
      perfil: true,
    },
  });
  return usuario;
}
