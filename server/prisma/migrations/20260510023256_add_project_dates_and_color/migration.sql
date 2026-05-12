-- AlterTable
ALTER TABLE "Projeto" ADD COLUMN     "cor" TEXT DEFAULT '#3B82F6',
ADD COLUMN     "data_fim" TIMESTAMP(3),
ADD COLUMN     "data_inicio" TIMESTAMP(3);
