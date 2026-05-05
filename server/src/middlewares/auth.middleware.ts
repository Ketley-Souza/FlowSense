import { FastifyReply, FastifyRequest } from "fastify";

export async function autenticarMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    reply.code(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: "Token de autenticação inválido ou ausente.",
    });
  }
}
