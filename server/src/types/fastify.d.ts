import { Perfil } from "@prisma/client";
import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      sub: string;
      perfil: Perfil;
    };
  }
}
