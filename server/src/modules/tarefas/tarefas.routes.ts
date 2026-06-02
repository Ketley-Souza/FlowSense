import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { autenticarMiddleware } from "../../middlewares/auth.middleware";
import {
  adicionarAnexo,
  adicionarComentario,
  atualizarTarefa,
  criarTarefa,
  deletarTarefa,
  listarAnexosTarefa,
  listarTarefas,
  listarTarefasPorProjeto,
  deletarAnexoTarefa,
} from "./tarefas.service";
import { salvarAnexoTarefa, deletarArquivo } from "../../lib/upload";

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

  fastify.log.error(err);
  return reply.code(500).send({
    statusCode: 500,
    error: "Internal Server Error",
    message: "Erro interno. Tente novamente mais tarde.",
  });
}

export async function tarefasRoutes(fastify: FastifyInstance): Promise<void> {

  fastify.addHook("preHandler", autenticarMiddleware);

  fastify.get(
    "/tarefas",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const tarefas = await listarTarefas(request.user.sub);
        return reply.send(tarefas);
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  fastify.get(
    "/projetos/:id/tarefas",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const tarefas = await listarTarefasPorProjeto(
          request.params.id,
          request.user.sub
        );
        return reply.send(tarefas);
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  fastify.post(
    "/tarefas",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const tarefa = await criarTarefa(
          request.body as unknown,
          request.user.sub
        );
        return reply.code(201).send(tarefa);
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  fastify.patch(
    "/tarefas/:id",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const tarefa = await atualizarTarefa(
          request.params.id,
          request.body as unknown,
          request.user.sub
        );
        return reply.send(tarefa);
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  fastify.post(
    "/tarefas/:id/comentarios",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const tarefa = await adicionarComentario(
          request.params.id,
          request.body as unknown,
          request.user.sub
        );
        return reply.code(201).send(tarefa);
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  // GET /tarefas/:id/anexos
  fastify.get(
    "/tarefas/:id/anexos",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const anexos = await listarAnexosTarefa(
          request.params.id,
          request.user.sub
        );
        return reply.send(anexos);
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  // POST /tarefas/:id/anexos  (multipart)
  fastify.post(
    "/tarefas/:id/anexos",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const file = await request.file();
        if (!file) {
          return reply.code(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: "Nenhum arquivo enviado.",
          });
        }

        const { url, nome, tipo, tamanho } = await salvarAnexoTarefa(file);
        const tarefa = await adicionarAnexo(
          request.params.id,
          { url, nome, tipo, tamanho },
          request.user.sub
        );
        return reply.code(201).send(tarefa);
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  // DELETE /tarefas/:id/anexos/:anexoId
  fastify.delete(
    "/tarefas/:id/anexos/:anexoId",
    async (
      request: FastifyRequest<{ Params: { id: string; anexoId: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { url } = await deletarAnexoTarefa(
          request.params.id,
          request.params.anexoId,
          request.user.sub
        );
        deletarArquivo(url).catch(() => {});
        return reply.code(204).send();
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );

  fastify.delete(
    "/tarefas/:id",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        await deletarTarefa(
          request.params.id,
          request.user.sub,
          request.user.perfil
        );
        return reply.code(204).send();
      } catch (err) {
        return handleServiceError(err, reply, fastify);
      }
    }
  );
}
