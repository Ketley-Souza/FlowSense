-- AlterEnum
ALTER TYPE "Cargo" ADD VALUE 'ADMIN';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoNotificacao" ADD VALUE 'TAREFA_CRIADA';
ALTER TYPE "TipoNotificacao" ADD VALUE 'TAREFA_EXCLUIDA';
ALTER TYPE "TipoNotificacao" ADD VALUE 'ANEXO_ADICIONADO';
