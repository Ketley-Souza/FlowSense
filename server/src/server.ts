import "dotenv/config";
import path from "path";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import staticFiles from "@fastify/static";
import { authRoutes } from "./modules/auth/auth.routes";
import { tarefasRoutes } from "./modules/tarefas/tarefas.routes";
import { projetosRoutes } from "./modules/projetos/projetos.routes";
import { usuariosRoutes } from "./modules/usuarios/usuarios.routes";
import { equipesRoutes } from "./modules/equipes/equipes.routes";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { notificacoesRoutes } from "./modules/notificacoes/notificacoes.routes";
import { inicializarAgendador } from "./agendador";

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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await fastify.register(jwt, {
    secret: process.env["JWT_SECRET"] ?? "flowsense_fallback_secret",
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: 20 * 1024 * 1024, //limite de tamanho
    },
  });

  await fastify.register(staticFiles, {
    root: path.join(process.cwd(), "uploads"),
    prefix: "/uploads/",
    decorateReply: false,
  });

  await fastify.register(authRoutes);
  await fastify.register(tarefasRoutes);
  await fastify.register(projetosRoutes);
  await fastify.register(usuariosRoutes);
  await fastify.register(equipesRoutes);
  await fastify.register(dashboardRoutes);
  await fastify.register(notificacoesRoutes);

  fastify.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "FlowSense API",
  }));


  const PORT = Number(process.env["PORT"] ?? 3333);
  const HOST = "0.0.0.0";

  await fastify.listen({ port: PORT, host: HOST });

  console.log(`\n rodando em http://localhost:${PORT}`);
  console.log(`conferir integridade em http://localhost:${PORT}/health\n`);

  // Inicializar jobs agendados após o servidor estar online
  inicializarAgendador();
}

bootstrap().catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});