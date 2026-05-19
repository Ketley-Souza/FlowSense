import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { autenticarMiddleware } from "../../middlewares/auth.middleware";
import { getDashboardData } from "./dashboard.service";

export async function dashboardRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook("preHandler", autenticarMiddleware);

  fastify.get(
    "/dashboard",
    async (
      request: FastifyRequest<{ Querystring: { projetoId?: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { projetoId } = request.query;
        const data = await getDashboardData(request.user.sub, projetoId);
        return reply.send(data);
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({
          statusCode: 500,
          error: "Internal Server Error",
          message: "Erro ao carregar dashboard.",
        });
      }
    }
  );
}
