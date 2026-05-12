import bcrypt from "bcryptjs";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import prisma from "../../lib/prisma";
import crypto from "crypto";

//validação

const registrarSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres."),
  email: z.string().email("E-mail inválido."),
  login: z
    .string()
    .min(3, "Login deve ter ao menos 3 caracteres.")
    .regex(/^[a-zA-Z0-9_]+$/, "Login só pode conter letras, números e _."),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres."),
});

const loginSchema = z.object({
  //const pra email ou user
  identificador: z
    .string()
    .min(1, "Informe seu e-mail ou nome de usuário."),
  senha: z.string().min(1, "Informe sua senha."),
});

const ativarContaSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  login: z
    .string()
    .min(3, "Login deve ter ao menos 3 caracteres.")
    .regex(/^[a-zA-Z0-9_]+$/, "Login só pode conter letras, números e _."),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres."),
});

//serviço

export async function registrar(data: unknown) {
  const { nome, email, login, senha } = registrarSchema.parse(data);
  const usuarioExistente = await prisma.usuario.findFirst({
    where: { OR: [{ email }, { login }] },
    select: { email: true, login: true },
  });

  if (usuarioExistente) {
    const campo = usuarioExistente.email === email ? "E-mail" : "Login";
    const error = new Error(`${campo} já está em uso.`);
    (error as NodeJS.ErrnoException).code = "CONFLICT";
    throw error;
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.usuario.create({
    data: { 
      nome, 
      email, 
      login, 
      senha: senhaHash,
      status: "ATIVO",
    },
    select: {
      id: true,
      nome: true,
      email: true,
      login: true,
      foto_url: true,
      perfil: true,
      createdAt: true,
    },
  });

  // Criar equipe padrão para o novo usuário
  try {
    await prisma.equipe.create({
      data: {
        nome: `Equipe de ${nome}`,
        descricao: "Minha primeira equipe",
        dono_id: usuario.id,
        usuarios: {
          create: {
            usuario_id: usuario.id,
            cargo: "ADMIN",
            status: "ATIVO",
            ativado_em: new Date(),
          },
        },
      },
    });
  } catch (error) {
    console.error("Erro ao criar equipe padrão:", error);
    // Não falhar se a equipe não for criada
  }

  return usuario;
}

export async function autenticar(
  data: unknown,
  fastify: FastifyInstance
) {
  const { identificador, senha } = loginSchema.parse(data);

  const ehEmail = identificador.includes("@");

  const usuario = await prisma.usuario.findFirst({
    where: ehEmail ? { email: identificador } : { login: identificador },
  });

  if (!usuario) {
    const error = new Error("Credenciais inválidas.");
    (error as NodeJS.ErrnoException).code = "UNAUTHORIZED";
    throw error;
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    const error = new Error("Credenciais inválidas.");
    (error as NodeJS.ErrnoException).code = "UNAUTHORIZED";
    throw error;
  }

  const token = fastify.jwt.sign(
    { sub: usuario.id, perfil: usuario.perfil },
    { expiresIn: process.env["JWT_EXPIRES_IN"] ?? "7d" }
  );

  const { senha: _senha, ...usuarioSemSenha } = usuario;

  return { token, usuario: usuarioSemSenha };
}

export async function ativarConta(
  data: unknown,
  fastify: FastifyInstance
) {
  const { token: tokenPlain, login, senha } = ativarContaSchema.parse(data);

  // Procurar token
  const tokenHash = crypto.createHash("sha256").update(tokenPlain).digest("hex");
  const token = await prisma.tokenAtivacao.findUnique({
    where: { token: tokenHash },
  });

  if (!token) {
    const error = new Error("Token inválido");
    (error as NodeJS.ErrnoException).code = "NOT_FOUND";
    throw error;
  }

  if (token.utilizado) {
    const error = new Error("Token já foi utilizado");
    (error as NodeJS.ErrnoException).code = "CONFLICT";
    throw error;
  }

  if (new Date() > token.expira_em) {
    const error = new Error("Token expirado");
    (error as NodeJS.ErrnoException).code = "CONFLICT";
    throw error;
  }

  // Verificar se login já existe
  const loginExistente = await prisma.usuario.findUnique({
    where: { login },
  });

  if (loginExistente && loginExistente.id !== token.usuario_id) {
    const error = new Error("Login já está em uso");
    (error as NodeJS.ErrnoException).code = "CONFLICT";
    throw error;
  }

  // Fazer hash da senha
  const senhaHash = await bcrypt.hash(senha, 10);

  // Atualizar usuário
  const usuario = await prisma.usuario.update({
    where: { id: token.usuario_id },
    data: {
      status: "ATIVO",
      login,
      senha: senhaHash,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      login: true,
      foto_url: true,
      perfil: true,
      createdAt: true,
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

  // Gerar JWT
  const jwtToken = fastify.jwt.sign(
    { sub: usuario.id, perfil: usuario.perfil },
    { expiresIn: process.env["JWT_EXPIRES_IN"] ?? "7d" }
  );

  return { token: jwtToken, usuario };
}
export { registrarSchema, loginSchema, ativarContaSchema };
