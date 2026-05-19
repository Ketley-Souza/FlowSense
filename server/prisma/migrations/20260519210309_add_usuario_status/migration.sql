-- CreateEnum
CREATE TYPE "StatusUsuario" AS ENUM ('ATIVO', 'PENDENTE', 'DESATIVADO');

-- CreateEnum
CREATE TYPE "CargoEquipe" AS ENUM ('ADMIN', 'GERENTE', 'MEMBRO');

-- CreateEnum
CREATE TYPE "StatusUsuarioEquipe" AS ENUM ('ATIVO', 'PENDENTE', 'DESATIVADO');

-- CreateEnum
CREATE TYPE "TipoToken" AS ENUM ('CONVITE_EQUIPE', 'RESETAR_SENHA');

-- AlterTable
ALTER TABLE "Projeto" ADD COLUMN     "equipe_id" TEXT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "status" "StatusUsuario" NOT NULL DEFAULT 'ATIVO';

-- CreateTable
CREATE TABLE "Equipe" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "dono_id" TEXT NOT NULL,
    "eh_pessoal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioEquipe" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "equipe_id" TEXT NOT NULL,
    "cargo" "CargoEquipe" NOT NULL DEFAULT 'MEMBRO',
    "status" "StatusUsuarioEquipe" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativado_em" TIMESTAMP(3),

    CONSTRAINT "UsuarioEquipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenAtivacao" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "equipe_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tipo" "TipoToken" NOT NULL DEFAULT 'CONVITE_EQUIPE',
    "utilizado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "utilizado_em" TIMESTAMP(3),

    CONSTRAINT "TokenAtivacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioEquipe_usuario_id_equipe_id_key" ON "UsuarioEquipe"("usuario_id", "equipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "TokenAtivacao_token_key" ON "TokenAtivacao"("token");

-- AddForeignKey
ALTER TABLE "Equipe" ADD CONSTRAINT "Equipe_dono_id_fkey" FOREIGN KEY ("dono_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioEquipe" ADD CONSTRAINT "UsuarioEquipe_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioEquipe" ADD CONSTRAINT "UsuarioEquipe_equipe_id_fkey" FOREIGN KEY ("equipe_id") REFERENCES "Equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenAtivacao" ADD CONSTRAINT "TokenAtivacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenAtivacao" ADD CONSTRAINT "TokenAtivacao_equipe_id_fkey" FOREIGN KEY ("equipe_id") REFERENCES "Equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_equipe_id_fkey" FOREIGN KEY ("equipe_id") REFERENCES "Equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
