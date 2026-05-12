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
      `Usuário com ${
        usuarioExistente.email === payload.email ? "este email" : "este login"
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

export async function listarUsuarios() {
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
