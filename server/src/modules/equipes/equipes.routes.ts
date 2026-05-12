import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { autenticarMiddleware } from "../../middlewares/auth.middleware";
import {
  criarEquipe,
  criarEquipeSchema,
  listarEquipesDoUsuario,
  convidarMembro,
  convidarMembroSchema,
  listarMembrosEquipe,
} from "./equipes.service";

function handleServiceError(
  err: unknown,
  reply: FastifyReply,
  fastify: FastifyInstance
): FastifyReply {
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

  if (error.code === "NOT_FOUND") {
    return reply.code(404).send({
      statusCode: 404,
      error: "Not Found",
      message: error.message,
    });
  }

  if (error.code === "FORBIDDEN") {
    return reply.code(403).send({
      statusCode: 403,
      error: "Forbidden",
      message: error.message,
    });
  }

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
    message: "Erro interno. Tente novamente mais tarde.",
  });
}

export async function equipesRoutes(
  fastify: FastifyInstance
): Promise<void> {
  fastify.addHook("preHandler", autenticarMiddleware);

  // POST /equipes - Criar nova equipe
  fastify.post(
    "/equipes",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const dados = criarEquipeSchema.parse(request.body);
        const equipe = await criarEquipe(request.user.sub, dados);
        return reply.code(201).send(equipe);
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  // GET /equipes - Listar equipes do usuário
  fastify.get("/equipes", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const equipes = await listarEquipesDoUsuario(request.user.sub);
      return reply.send(equipes);
    } catch (err) {
      return handleServiceError(err, reply, fastify);
    }
  });

  // POST /equipes/:id/convidar - Convidar membro
  fastify.post(
    "/equipes/:id/convidar",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const dados = convidarMembroSchema.parse(request.body);
        const resultado = await convidarMembro(
          request.user.sub,
          request.params.id,
          dados
        );
        return reply.code(201).send(resultado);
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  // GET /equipes/:id/membros - Listar membros da equipe
  fastify.get(
    "/equipes/:id/membros",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const membros = await listarMembrosEquipe(request.params.id, request.user.sub);
        return reply.send(membros);
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );
}
