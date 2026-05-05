import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { autenticar, registrar } from "./auth.service";

export async function authRoutes(fastify: FastifyInstance): Promise<void> {

  fastify.post(
    "/auth/register",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const usuario = await registrar(request.body as Record<string, unknown>);
        return reply.code(201).send({
          message: "Usuário criado com sucesso.",
          usuario,
        });
      } catch (err) {
        if (err instanceof ZodError) {
          return reply.code(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: "Dados inválidos.",
            detalhes: err.errors.map((e) => ({
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
          message: "Erro interno. Tente novamente mais tarde.",
        });
      }
    }
  );


  fastify.post(
    "/auth/login",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const resultado = await autenticar(
          request.body as Record<string, unknown>,
          fastify
        );
        return reply.code(200).send(resultado);
      } catch (err) {
        if (err instanceof ZodError) {
          return reply.code(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: "Dados inválidos.",
            detalhes: err.errors.map((e) => ({
              campo: e.path.join("."),
              mensagem: e.message,
            })),
          });
        }

        const error = err as NodeJS.ErrnoException;

        if (error.code === "UNAUTHORIZED") {
          return reply.code(401).send({
            statusCode: 401,
            error: "Unauthorized",
            message: error.message,
          });
        }

        fastify.log.error(err);
        return reply.code(500).send({
          statusCode: 500,
          error: "Internal Server Error",
          message: "erro, tente novamente",
        });
      }
    }
  );
}
