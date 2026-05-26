import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { autenticar, registrar, ativarConta, obterDetalhesConvite } from "./auth.service";
import { salvarAvatar } from "../../lib/upload";

export async function authRoutes(fastify: FastifyInstance): Promise<void> {

  fastify.post(
    "/auth/register",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Parsear multipart (campos de texto + arquivo opcional)
        const parts = request.parts();
        const fields: Record<string, string> = {};
        let foto_url: string | undefined;

        for await (const part of parts) {
          if (part.type === "file") {
            if (part.fieldname === "foto") {
              foto_url = await salvarAvatar(part);
            } else {
              await part.toBuffer(); // consumir para não vazar
            }
          } else {
            fields[part.fieldname] = part.value as string;
          }
        }

        fastify.log.info({ fields }, "Register request received");
        const usuario = await registrar({ ...fields, foto_url });
        return reply.code(201).send({
          message: "Usuário criado com sucesso.",
          usuario,
        });
      } catch (err) {
        fastify.log.error({ err }, "Register error");
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

        if (error.code === "BAD_REQUEST") {
          return reply.code(400).send({
            statusCode: 400,
            error: "Bad Request",
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
        fastify.log.info({ body: request.body }, "Login request received");
        const resultado = await autenticar(
          request.body as unknown,
          fastify
        );
        return reply.code(200).send(resultado);
      } catch (err) {
        fastify.log.error({ err }, "Login error");
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

  // POST /auth/ativar - Ativar conta com token
  fastify.post(
    "/auth/ativar",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        fastify.log.info({ body: request.body }, "Ativar conta request received");
        const resultado = await ativarConta(
          request.body as unknown,
          fastify
        );
        return reply.code(200).send(resultado);
      } catch (err) {
        fastify.log.error({ err }, "Ativar conta error");
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
          message: "erro, tente novamente",
        });
      }
    }
  );

  // GET /auth/convite/:token - Obter detalhes do convite
  fastify.get(
    "/auth/convite/:token",
    async (request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) => {
      try {
        const resultado = await obterDetalhesConvite(request.params.token);
        return reply.code(200).send(resultado);
      } catch (err) {
        fastify.log.error({ err }, "Obter detalhes convite erro");
        const error = err as NodeJS.ErrnoException;

        if (error.code === "NOT_FOUND") {
          return reply.code(404).send({
            statusCode: 404,
            error: "Not Found",
            message: error.message,
          });
        }

        if (error.code === "CONFLICT" || error.code === "BAD_REQUEST") {
          return reply.code(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }

        return reply.code(500).send({
          statusCode: 500,
          error: "Internal Server Error",
          message: "Erro interno. Tente novamente.",
        });
      }
    }
  );
}
