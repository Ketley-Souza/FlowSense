-- CreateTable
CREATE TABLE "AnexoProjeto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanho" INTEGER,
    "id_projeto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnexoProjeto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AnexoProjeto" ADD CONSTRAINT "AnexoProjeto_id_projeto_fkey" FOREIGN KEY ("id_projeto") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
