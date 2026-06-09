import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import {
  criarUsuarioEquipe,
  listarUsuarios,
  atualizarAvatar,
  atualizarPerfil,
  obterPerfil,
  alterarSenha,
  salvarPreferencias,
} from "./usuarios.service";
import { autenticarMiddleware } from "../../middlewares/auth.middleware";
import { salvarAvatar } from "../../lib/upload";

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

  // GET /usuarios/perfil - Obter perfil completo (inclui preferências)
  fastify.get(
    "/usuarios/perfil",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const usuario = await obterPerfil(request.user.sub);
        return reply.send({ usuario });
      } catch (err) {
        const error = err as NodeJS.ErrnoException;
        if (error.code === "NOT_FOUND") {
          return reply.code(404).send({
            statusCode: 404,
            error: "Not Found",
            message: error.message,
          });
        }
        fastify.log.error(err);
        return reply.code(500).send({
          statusCode: 500,
          error: "Internal Server Error",
          message: "Erro ao obter perfil.",
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

  // PATCH /usuarios/perfil/avatar - Atualizar foto do perfil
  fastify.patch(
    "/usuarios/perfil/avatar",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const file = await request.file();
        if (!file) {
          return reply.code(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: "Nenhum arquivo enviado.",
          });
        }

        const foto_url = await salvarAvatar(file);
        const usuario = await atualizarAvatar(request.user.sub, foto_url);

        return reply.send({ usuario });
      } catch (err) {
        const error = err as NodeJS.ErrnoException;
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
          message: "Erro ao atualizar avatar.",
        });
      }
    }
  );

  // PATCH /usuarios/perfil - Atualizar nome e/ou email
  fastify.patch(
    "/usuarios/perfil",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const usuario = await atualizarPerfil(
          request.user.sub,
          request.body as unknown
        );
        return reply.send({ usuario });
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
          message: "Erro ao atualizar perfil.",
        });
      }
    }
  );
  // PATCH /usuarios/perfil/senha - Alterar senha do usuário
  fastify.patch(
    "/usuarios/perfil/senha",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await alterarSenha(request.user.sub, request.body as unknown);
        return reply.send({ message: "Senha alterada com sucesso." });
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
        if (error.code === "UNAUTHORIZED") {
          return reply.code(401).send({
            statusCode: 401,
            error: "Unauthorized",
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
        fastify.log.error(err);
        return reply.code(500).send({
          statusCode: 500,
          error: "Internal Server Error",
          message: "Erro ao alterar senha.",
        });
      }
    }
  );

  // PATCH /usuarios/perfil/preferencias - Salvar preferências de notificação
  fastify.patch(
    "/usuarios/perfil/preferencias",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const preferencias = await salvarPreferencias(
          request.user.sub,
          request.body as unknown
        );
        return reply.send({ preferencias });
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
        fastify.log.error(err);
        return reply.code(500).send({
          statusCode: 500,
          error: "Internal Server Error",
          message: "Erro ao salvar preferências.",
        });
      }
    }
  );
}
