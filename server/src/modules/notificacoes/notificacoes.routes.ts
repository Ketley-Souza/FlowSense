import { FastifyInstance } from "fastify";
import {
  listarNotificacoes,
  contarNaoLidas,
  marcarComoLida,
  marcarComoNaoLida,
  marcarTodasComoLidas,
  deletarNotificacao,
  limparNotificacoesLidas,
} from "./notificacoes.service";

function mapearErroHTTP(code?: string): number {
  switch (code) {
    case "NOT_FOUND":
      return 404;
    case "FORBIDDEN":
      return 403;
    case "BAD_REQUEST":
      return 400;
    case "CONFLICT":
      return 409;
    default:
      return 500;
  }
}

export async function notificacoesRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticação
  const authHook = {
    preHandler: async (request: any) => {
      await request.jwtVerify();
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // GET /notificacoes — listar notificações do usuário autenticado
  // ─────────────────────────────────────────────────────────────────────────
  fastify.get("/notificacoes", authHook, async (request, reply) => {
    try {
      const usuario = (request as any).user as { id: string };
      const resultado = await listarNotificacoes(usuario.id);
      return reply.status(200).send(resultado);
    } catch (err: any) {
      const status = mapearErroHTTP(err.code);
      return reply.status(status).send({ error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /notificacoes/contagem — contagem de não-lidas (para o badge)
  // ─────────────────────────────────────────────────────────────────────────
  fastify.get("/notificacoes/contagem", authHook, async (request, reply) => {
    try {
      const usuario = (request as any).user as { id: string };
      const count = await contarNaoLidas(usuario.id);
      return reply.status(200).send({ count });
    } catch (err: any) {
      const status = mapearErroHTTP(err.code);
      return reply.status(status).send({ error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // PATCH /notificacoes/:id/ler — marcar como lida
  // ─────────────────────────────────────────────────────────────────────────
  fastify.patch<{ Params: { id: string } }>(
    "/notificacoes/:id/ler",
    authHook,
    async (request, reply) => {
      try {
        const usuario = (request as any).user as { id: string };
        const notificacao = await marcarComoLida(request.params.id, usuario.id);
        return reply.status(200).send(notificacao);
      } catch (err: any) {
        const status = mapearErroHTTP(err.code);
        return reply.status(status).send({ error: err.message });
      }
    }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // PATCH /notificacoes/:id/nao-ler — marcar como não-lida
  // ─────────────────────────────────────────────────────────────────────────
  fastify.patch<{ Params: { id: string } }>(
    "/notificacoes/:id/nao-ler",
    authHook,
    async (request, reply) => {
      try {
        const usuario = (request as any).user as { id: string };
        const notificacao = await marcarComoNaoLida(request.params.id, usuario.id);
        return reply.status(200).send(notificacao);
      } catch (err: any) {
        const status = mapearErroHTTP(err.code);
        return reply.status(status).send({ error: err.message });
      }
    }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // PATCH /notificacoes/ler-todas — marcar todas como lidas
  // ─────────────────────────────────────────────────────────────────────────
  fastify.patch("/notificacoes/ler-todas", authHook, async (request, reply) => {
    try {
      const usuario = (request as any).user as { id: string };
      await marcarTodasComoLidas(usuario.id);
      return reply.status(200).send({ message: "Todas as notificações foram marcadas como lidas." });
    } catch (err: any) {
      const status = mapearErroHTTP(err.code);
      return reply.status(status).send({ error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE /notificacoes/lidas — limpar todas as lidas
  // ─────────────────────────────────────────────────────────────────────────
  fastify.delete("/notificacoes/lidas", authHook, async (request, reply) => {
    try {
      const usuario = (request as any).user as { id: string };
      await limparNotificacoesLidas(usuario.id);
      return reply.status(200).send({ message: "Notificações lidas removidas." });
    } catch (err: any) {
      const status = mapearErroHTTP(err.code);
      return reply.status(status).send({ error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE /notificacoes/:id — deletar uma notificação específica
  // ─────────────────────────────────────────────────────────────────────────
  fastify.delete<{ Params: { id: string } }>(
    "/notificacoes/:id",
    authHook,
    async (request, reply) => {
      try {
        const usuario = (request as any).user as { id: string };
        await deletarNotificacao(request.params.id, usuario.id);
        return reply.status(204).send();
      } catch (err: any) {
        const status = mapearErroHTTP(err.code);
        return reply.status(status).send({ error: err.message });
      }
    }
  );
}
