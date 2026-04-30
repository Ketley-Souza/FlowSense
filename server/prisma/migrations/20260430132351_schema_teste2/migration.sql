/*
  Warnings:

  - The values [VERDE,AMARELO,VERMELHO] on the enum `Prioridade` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `data_hora` on the `Comentario` table. All the data in the column will be lost.
  - You are about to drop the column `data_hora` on the `HistoricoTarefa` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_alteracao` on the `HistoricoTarefa` table. All the data in the column will be lost.
  - You are about to drop the column `data_notificacao` on the `Notificacao` table. All the data in the column will be lost.
  - You are about to drop the column `id_tarefa` on the `Notificacao` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_alteracao` on the `Notificacao` table. All the data in the column will be lost.
  - You are about to drop the column `id_gerente` on the `Projeto` table. All the data in the column will be lost.
  - You are about to drop the column `data_criacao` on the `Tarefa` table. All the data in the column will be lost.
  - You are about to drop the column `status_risco_atraso` on the `Tarefa` table. All the data in the column will be lost.
  - Added the required column `ordem` to the `ColunaKanban` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ColunaKanban` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Comentario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campo_alterado` to the `HistoricoTarefa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mensagem` to the `Notificacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Projeto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cargo` to the `ProjetoMembro` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tarefa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Cargo" AS ENUM ('GERENTE', 'MEMBRO');

-- CreateEnum
CREATE TYPE "StatusNotificacao" AS ENUM ('NAO_LIDA', 'LIDA');

-- AlterEnum
BEGIN;
CREATE TYPE "Prioridade_new" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');
ALTER TABLE "public"."Tarefa" ALTER COLUMN "prioridade" DROP DEFAULT;
ALTER TABLE "Tarefa" ALTER COLUMN "prioridade" TYPE "Prioridade_new" USING ("prioridade"::text::"Prioridade_new");
ALTER TYPE "Prioridade" RENAME TO "Prioridade_old";
ALTER TYPE "Prioridade_new" RENAME TO "Prioridade";
DROP TYPE "public"."Prioridade_old";
ALTER TABLE "Tarefa" ALTER COLUMN "prioridade" SET DEFAULT 'MEDIA';
COMMIT;

-- DropForeignKey
ALTER TABLE "ColunaKanban" DROP CONSTRAINT "ColunaKanban_id_projeto_fkey";

-- DropForeignKey
ALTER TABLE "Comentario" DROP CONSTRAINT "Comentario_id_tarefa_fkey";

-- DropForeignKey
ALTER TABLE "Comentario" DROP CONSTRAINT "Comentario_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "HistoricoTarefa" DROP CONSTRAINT "HistoricoTarefa_id_tarefa_fkey";

-- DropForeignKey
ALTER TABLE "HistoricoTarefa" DROP CONSTRAINT "HistoricoTarefa_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "Notificacao" DROP CONSTRAINT "Notificacao_id_tarefa_fkey";

-- DropForeignKey
ALTER TABLE "Notificacao" DROP CONSTRAINT "Notificacao_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "Projeto" DROP CONSTRAINT "Projeto_id_gerente_fkey";

-- DropForeignKey
ALTER TABLE "ProjetoMembro" DROP CONSTRAINT "ProjetoMembro_id_projeto_fkey";

-- DropForeignKey
ALTER TABLE "ProjetoMembro" DROP CONSTRAINT "ProjetoMembro_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "Tarefa" DROP CONSTRAINT "Tarefa_id_projeto_fkey";

-- DropForeignKey
ALTER TABLE "Tarefa" DROP CONSTRAINT "Tarefa_id_responsavel_fkey";

-- DropForeignKey
ALTER TABLE "TarefaMembro" DROP CONSTRAINT "TarefaMembro_id_tarefa_fkey";

-- DropForeignKey
ALTER TABLE "TarefaMembro" DROP CONSTRAINT "TarefaMembro_id_usuario_fkey";

-- AlterTable
ALTER TABLE "ColunaKanban" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ordem" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Comentario" DROP COLUMN "data_hora",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "HistoricoTarefa" DROP COLUMN "data_hora",
DROP COLUMN "tipo_alteracao",
ADD COLUMN     "campo_alterado" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "valor_antigo" TEXT,
ADD COLUMN     "valor_novo" TEXT;

-- AlterTable
ALTER TABLE "Notificacao" DROP COLUMN "data_notificacao",
DROP COLUMN "id_tarefa",
DROP COLUMN "tipo_alteracao",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mensagem" TEXT NOT NULL,
ADD COLUMN     "status" "StatusNotificacao" NOT NULL DEFAULT 'NAO_LIDA',
ADD COLUMN     "tarefaId" TEXT;

-- AlterTable
ALTER TABLE "Projeto" DROP COLUMN "id_gerente",
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProjetoMembro" ADD COLUMN     "cargo" "Cargo" NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Tarefa" DROP COLUMN "data_criacao",
DROP COLUMN "status_risco_atraso",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "data_fim" TIMESTAMP(3),
ADD COLUMN     "data_inicio" TIMESTAMP(3),
ADD COLUMN     "ordem" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "progresso" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "prioridade" SET DEFAULT 'MEDIA';

-- AlterTable
ALTER TABLE "TarefaMembro" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "foto_url" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "RiscoAtraso";

-- CreateTable
CREATE TABLE "Subtarefa" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "id_tarefa" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subtarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT NOT NULL DEFAULT '#000000',
    "id_projeto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TarefaTag" (
    "id_tarefa" TEXT NOT NULL,
    "id_tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TarefaTag_pkey" PRIMARY KEY ("id_tarefa","id_tag")
);

-- CreateTable
CREATE TABLE "Anexo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "id_tarefa" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anexo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_id_projeto_nome_key" ON "Tag"("id_projeto", "nome");

-- AddForeignKey
ALTER TABLE "ProjetoMembro" ADD CONSTRAINT "ProjetoMembro_id_projeto_fkey" FOREIGN KEY ("id_projeto") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetoMembro" ADD CONSTRAINT "ProjetoMembro_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColunaKanban" ADD CONSTRAINT "ColunaKanban_id_projeto_fkey" FOREIGN KEY ("id_projeto") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_id_responsavel_fkey" FOREIGN KEY ("id_responsavel") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_id_projeto_fkey" FOREIGN KEY ("id_projeto") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtarefa" ADD CONSTRAINT "Subtarefa_id_tarefa_fkey" FOREIGN KEY ("id_tarefa") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaMembro" ADD CONSTRAINT "TarefaMembro_id_tarefa_fkey" FOREIGN KEY ("id_tarefa") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaMembro" ADD CONSTRAINT "TarefaMembro_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_id_projeto_fkey" FOREIGN KEY ("id_projeto") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaTag" ADD CONSTRAINT "TarefaTag_id_tarefa_fkey" FOREIGN KEY ("id_tarefa") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaTag" ADD CONSTRAINT "TarefaTag_id_tag_fkey" FOREIGN KEY ("id_tag") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_id_tarefa_fkey" FOREIGN KEY ("id_tarefa") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_id_tarefa_fkey" FOREIGN KEY ("id_tarefa") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoTarefa" ADD CONSTRAINT "HistoricoTarefa_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoTarefa" ADD CONSTRAINT "HistoricoTarefa_id_tarefa_fkey" FOREIGN KEY ("id_tarefa") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
