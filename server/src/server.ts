import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { authRoutes } from "./modules/auth/auth.routes";
import { tarefasRoutes } from "./modules/tarefas/tarefas.routes";

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
});

async function bootstrap() {

  await fastify.register(cors, {
    origin: process.env["FRONTEND_URL"] ?? true,
    credentials: true,
  });

  await fastify.register(jwt, {
    secret: process.env["JWT_SECRET"] ?? "flowsense_fallback_secret",
  });


  await fastify.register(authRoutes);
  await fastify.register(tarefasRoutes);

  fastify.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "FlowSense API",
  }));


  const PORT = Number(process.env["PORT"] ?? 3333);
  const HOST = "0.0.0.0";

  await fastify.listen({ port: PORT, host: HOST });

  console.log(`\n🚀 FlowSense API rodando em http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health\n`);
}

bootstrap().catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});