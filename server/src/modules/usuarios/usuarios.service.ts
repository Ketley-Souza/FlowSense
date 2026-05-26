import { z } from "zod";
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
      perfil: true,
    },
  });
  return usuario;
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
      perfil: true,
    },
  });
  return usuario;
}
