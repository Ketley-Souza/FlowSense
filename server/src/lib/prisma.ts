import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

if (!process.env["DATABASE_URL"]) {
  throw new Error("DATABASE_URL não definida nas variáveis de ambiente.");
}

const pool = new Pool({
  connectionString: process.env["DATABASE_URL"],
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log:
    process.env["NODE_ENV"] === "development"
      ? ["query", "warn", "error"]
      : ["error"],
});

export default prisma;
