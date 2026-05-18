import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { criarUsuarioEquipe, listarUsuarios } from "./usuarios.service";
import { autenticarMiddleware } from "../../middlewares/auth.middleware";

export async function usuariosRoutes(
  fastify: FastifyInstance
): Promise<void> {
  // Middleware de autenticação para todas as rotas
  fastify.addHook("preHandler", autenticarMiddleware);

  // POST /usuarios - Criar novo usuário da equipe
  fastify.post(
    "/usuarios",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const usuario = await criarUsuarioEquipe(request.body as unknown);
        return reply.code(201).send(usuario);
      } catch (err) {
        if (err instanceof ZodError) {
          return reply.code(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: "Dados inválidos.",
            detalhes: err.issues.map((e) => ({
              campo: e.path.join("."),
              mensagem: e.message,
            })),
          });
        }

        const error = err as NodeJS.ErrnoException;

        if (error.code === "CONFLICT") {
          return reply.code(409).send({
            statusCode: 409,
            error: "Conflict",
            message: error.message,
          });
        }

        fastify.log.error(err);
        return reply.code(500).send({
          statusCode: 500,
          error: "Internal Server Error",
          message: "Erro ao criar usuário.",
        });
      }
    }
  );

  // GET /usuarios - Listar usuários relacionados (mesmas equipes ou projetos)
  fastify.get(
    "/usuarios",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const usuarios = await listarUsuarios(request.user.sub);
        return reply.send(usuarios);
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({
          statusCode: 500,
          error: "Internal Server Error",
          message: "Erro ao listar usuários.",
        });
      }
    }
  );
}
