-- CreateEnum
CREATE TYPE "TipoEscola" AS ENUM ('PARTICULAR', 'MUNICIPAL');

-- CreateEnum
CREATE TYPE "StatusMensalidade" AS ENUM ('PENDENTE', 'PAGA', 'ATRASADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('AGUARDANDO_CONFIRMACAO', 'CONFIRMADO', 'REJEITADO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('PIX', 'DINHEIRO', 'CARTAO', 'TRANSFERENCIA', 'OUTRO');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'RESPONSAVEL');

-- CreateTable
CREATE TABLE "Escola" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "pixKey" TEXT,
    "logoUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Escola_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "escolaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "senhaHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responsaveis" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "telefone" TEXT,
    "endereco" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "responsaveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alunos" (
    "id" TEXT NOT NULL,
    "idEscola" TEXT NOT NULL,
    "idResponsavel" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "serie" INTEGER NOT NULL,
    "matricula" TEXT NOT NULL,
    "tipoEscola" "TipoEscola" NOT NULL,
    "dataMatricula" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alunos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensalidades" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "competencia" DATE NOT NULL,
    "valorOriginal" DECIMAL(10,2) NOT NULL,
    "valorCobrado" DECIMAL(10,2) NOT NULL,
    "dataVencimento" DATE NOT NULL,
    "status" "StatusMensalidade" NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mensalidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL,
    "mensalidadeId" TEXT NOT NULL,
    "informadoPorId" TEXT NOT NULL,
    "confirmadoPorId" TEXT,
    "estornadoPorId" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "formaPagamento" "FormaPagamento" NOT NULL,
    "dataPagamento" DATE NOT NULL,
    "status" "StatusPagamento" NOT NULL DEFAULT 'AGUARDANDO_CONFIRMACAO',
    "comprovanteUrl" TEXT,
    "informadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmadoEm" TIMESTAMP(3),
    "rejeitadoEm" TIMESTAMP(3),
    "motivoRejeicao" TEXT,
    "estornadoEm" TIMESTAMP(3),
    "motivoEstorno" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despesas" (
    "id" TEXT NOT NULL,
    "escolaId" TEXT NOT NULL,
    "registradoPorId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "data" DATE NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "despesas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_escolaId_idx" ON "usuarios"("escolaId");

-- CreateIndex
CREATE INDEX "usuarios_role_idx" ON "usuarios"("role");

-- CreateIndex
CREATE UNIQUE INDEX "responsaveis_usuarioId_key" ON "responsaveis"("usuarioId");

-- CreateIndex
CREATE INDEX "alunos_idEscola_idx" ON "alunos"("idEscola");

-- CreateIndex
CREATE INDEX "alunos_idResponsavel_idx" ON "alunos"("idResponsavel");

-- CreateIndex
CREATE INDEX "alunos_nome_idx" ON "alunos"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_idEscola_matricula_key" ON "alunos"("idEscola", "matricula");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_idResponsavel_key" ON "alunos"("idResponsavel");

-- CreateIndex
CREATE INDEX "mensalidades_alunoId_idx" ON "mensalidades"("alunoId");

-- CreateIndex
CREATE INDEX "mensalidades_competencia_idx" ON "mensalidades"("competencia");

-- CreateIndex
CREATE INDEX "mensalidades_dataVencimento_idx" ON "mensalidades"("dataVencimento");

-- CreateIndex
CREATE INDEX "mensalidades_status_idx" ON "mensalidades"("status");

-- CreateIndex
CREATE UNIQUE INDEX "mensalidades_alunoId_competencia_key" ON "mensalidades"("alunoId", "competencia");

-- CreateIndex
CREATE INDEX "pagamentos_mensalidadeId_idx" ON "pagamentos"("mensalidadeId");

-- CreateIndex
CREATE INDEX "pagamentos_informadoPorId_idx" ON "pagamentos"("informadoPorId");

-- CreateIndex
CREATE INDEX "pagamentos_confirmadoPorId_idx" ON "pagamentos"("confirmadoPorId");

-- CreateIndex
CREATE INDEX "pagamentos_status_idx" ON "pagamentos"("status");

-- CreateIndex
CREATE INDEX "pagamentos_dataPagamento_idx" ON "pagamentos"("dataPagamento");

-- CreateIndex
CREATE INDEX "despesas_escolaId_idx" ON "despesas"("escolaId");

-- CreateIndex
CREATE INDEX "despesas_registradoPorId_idx" ON "despesas"("registradoPorId");

-- CreateIndex
CREATE INDEX "despesas_data_idx" ON "despesas"("data");

-- CreateIndex
CREATE INDEX "despesas_categoria_idx" ON "despesas"("categoria");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsaveis" ADD CONSTRAINT "responsaveis_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_idEscola_fkey" FOREIGN KEY ("idEscola") REFERENCES "Escola"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_idResponsavel_fkey" FOREIGN KEY ("idResponsavel") REFERENCES "responsaveis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensalidades" ADD CONSTRAINT "mensalidades_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_mensalidadeId_fkey" FOREIGN KEY ("mensalidadeId") REFERENCES "mensalidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_informadoPorId_fkey" FOREIGN KEY ("informadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_confirmadoPorId_fkey" FOREIGN KEY ("confirmadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_estornadoPorId_fkey" FOREIGN KEY ("estornadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despesas" ADD CONSTRAINT "despesas_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despesas" ADD CONSTRAINT "despesas_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
