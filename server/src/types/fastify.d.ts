import { Perfil } from "@prisma/client";
import "fastify";
import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string;
      perfil: Perfil;
    };
  }
}

declare module "fastify" {
  interface FastifyRequest {
    user: {
      sub: string;
      perfil: Perfil;
    };
  }
}
