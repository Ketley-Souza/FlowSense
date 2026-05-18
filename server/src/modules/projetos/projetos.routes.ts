import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { autenticarMiddleware } from "../../middlewares/auth.middleware";
import {
  obterProjeto,
  listarProjetos,
  criarProjeto,
  atualizarProjeto,
  deletarProjeto,
  adicionarMembroProjeto,
  removerMembroProjeto,
  atualizarCargoMembroProjeto,
} from "./projetos.service";

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

  if (error.code === "BAD_REQUEST") {
    return reply.code(400).send({
      statusCode: 400,
      error: "Bad Request",
      message: error.message,
    });
  }

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

export async function projetosRoutes(
  fastify: FastifyInstance
): Promise<void> {
  fastify.addHook("preHandler", autenticarMiddleware);

  fastify.get(
    "/projetos",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const projetos = await listarProjetos(request.user.sub);
        return reply.send(projetos);
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  fastify.get(
    "/projetos/:id",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const projeto = await obterProjeto(request.params.id, request.user.sub);
        return reply.send(projeto);
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  fastify.post(
    "/projetos",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const projeto = await criarProjeto(
          request.body as unknown,
          request.user.sub
        );
        return reply.code(201).send(projeto);
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  fastify.patch(
    "/projetos/:id",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const projeto = await atualizarProjeto(
          request.params.id,
          request.body as unknown,
          request.user.sub
        );
        return reply.send(projeto);
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  fastify.delete(
    "/projetos/:id",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        await deletarProjeto(request.params.id, request.user.sub);
        return reply.code(204).send();
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  fastify.post(
    "/projetos/:id/membros",
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { id_usuario: string; cargo?: "GERENTE" | "MEMBRO" };
      }>,
      reply: FastifyReply
    ) => {
      try {
        await adicionarMembroProjeto(
          request.params.id,
          request.body.id_usuario,
          request.body.cargo || "MEMBRO",
          request.user.sub
        );
        return reply.code(201).send({ message: "Membro adicionado com sucesso" });
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  fastify.delete(
    "/projetos/:id/membros/:userId",
    async (
      request: FastifyRequest<{ Params: { id: string; userId: string } }>,
      reply: FastifyReply
    ) => {
      try {
        await removerMembroProjeto(
          request.params.id,
          request.params.userId,
          request.user.sub
        );
        return reply.code(204).send();
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  fastify.patch(
    "/projetos/:id/membros/:userId",
    async (
      request: FastifyRequest<{
        Params: { id: string; userId: string };
        Body: { cargo: "GERENTE" | "MEMBRO" };
      }>,
      reply: FastifyReply
    ) => {
      try {
        await atualizarCargoMembroProjeto(
          request.params.id,
          request.params.userId,
          request.body.cargo,
          request.user.sub
        );
        return reply.send({ message: "Cargo do membro atualizado com sucesso" });
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );
}