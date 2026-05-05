import bcrypt from "bcryptjs";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import prisma from "../../lib/prisma";

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

//serviço

export async function registrar(data: z.infer<typeof registrarSchema>) {
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
    data: { nome, email, login, senha: senhaHash },
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

  return usuario;
}

export async function autenticar(
  data: z.infer<typeof loginSchema>,
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







export { registrarSchema, loginSchema };
