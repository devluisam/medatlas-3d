-- Jornadas de estudo: revisão SM-2 por usuário, quiz pontuado no servidor,
-- favoritos, cota de IA e chaves estáveis para o seed.
--
-- Única etapa que remove colunas: o agendamento SM-2 passa do cartão (global) para
-- flashcard_reviews (por usuário). O seed nunca criou flashcards, então a tabela
-- deve estar vazia; se não estiver, a migration para aqui em vez de descartar dados.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "flashcards") THEN
    RAISE EXCEPTION 'flashcards não está vazia: copie o agendamento para flashcard_reviews antes de aplicar esta migration';
  END IF;
END $$;

-- CreateEnum
CREATE TYPE "QuizSource" AS ENUM ('BANK', 'AI');

-- CreateEnum
CREATE TYPE "ContentOrigin" AS ENUM ('CURATED', 'AI_GENERATED');

-- CreateEnum
CREATE TYPE "AiUsageKind" AS ENUM ('CHAT', 'QUIZ_GENERATION');

-- DropForeignKey
ALTER TABLE "structure_pathologies" DROP CONSTRAINT "structure_pathologies_structureId_fkey";

-- DropForeignKey
ALTER TABLE "flashcards" DROP CONSTRAINT "flashcards_setId_fkey";

-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_structureId_fkey";

-- DropForeignKey
ALTER TABLE "study_notes" DROP CONSTRAINT "study_notes_structureId_fkey";

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "origin" "ContentOrigin" NOT NULL DEFAULT 'CURATED',
ADD COLUMN     "seedKey" TEXT;

-- AlterTable
ALTER TABLE "quiz_attempts" ADD COLUMN     "source" "QuizSource" NOT NULL DEFAULT 'BANK',
ADD COLUMN     "systems" "AnatomicalSystem"[],
ADD COLUMN     "timeLimitSeconds" INTEGER,
ALTER COLUMN "totalQ" SET DEFAULT 0,
ALTER COLUMN "correctQ" SET DEFAULT 0,
ALTER COLUMN "timeSeconds" SET DEFAULT 0,
ALTER COLUMN "score" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "quiz_attempt_questions" ADD COLUMN     "answeredAt" TIMESTAMP(3),
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "flashcards" DROP COLUMN "easeFactor",
DROP COLUMN "interval",
DROP COLUMN "lastReviewed",
DROP COLUMN "nextReview",
DROP COLUMN "repetitions",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "origin" "ContentOrigin" NOT NULL DEFAULT 'CURATED',
ADD COLUMN     "seedKey" TEXT;

-- AlterTable
ALTER TABLE "user_progress" ADD COLUMN     "firstViewed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "study_streaks" ADD COLUMN     "activities" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ai_conversations" ADD COLUMN     "structureSlug" TEXT;

-- CreateTable
CREATE TABLE "flashcard_reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "lastGrade" INTEGER,
    "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flashcard_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "AiUsageKind" NOT NULL,
    "tokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_structures" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_structures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flashcard_reviews_userId_dueAt_idx" ON "flashcard_reviews"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "flashcard_reviews_userId_flashcardId_key" ON "flashcard_reviews"("userId", "flashcardId");

-- CreateIndex
CREATE INDEX "ai_usage_userId_kind_createdAt_idx" ON "ai_usage"("userId", "kind", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_structures_userId_structureId_key" ON "favorite_structures"("userId", "structureId");

-- CreateIndex
CREATE UNIQUE INDEX "structure_pathologies_structureId_name_key" ON "structure_pathologies"("structureId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "questions_seedKey_key" ON "questions"("seedKey");

-- CreateIndex
CREATE INDEX "questions_structureId_idx" ON "questions"("structureId");

-- CreateIndex
CREATE INDEX "questions_origin_isActive_idx" ON "questions"("origin", "isActive");

-- CreateIndex
CREATE INDEX "quiz_attempts_userId_startedAt_idx" ON "quiz_attempts"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "quiz_attempt_questions_attemptId_position_idx" ON "quiz_attempt_questions"("attemptId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_attempt_questions_attemptId_questionId_key" ON "quiz_attempt_questions"("attemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "flashcards_seedKey_key" ON "flashcards"("seedKey");

-- CreateIndex
CREATE INDEX "flashcards_structureId_idx" ON "flashcards"("structureId");

-- CreateIndex
CREATE INDEX "user_progress_userId_lastViewed_idx" ON "user_progress"("userId", "lastViewed");

-- CreateIndex
CREATE INDEX "ai_conversations_userId_updatedAt_idx" ON "ai_conversations"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "ai_messages_conversationId_createdAt_idx" ON "ai_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "study_notes_userId_structureId_key" ON "study_notes"("userId", "structureId");

-- AddForeignKey
ALTER TABLE "structure_pathologies" ADD CONSTRAINT "structure_pathologies_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "anatomical_structures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_setId_fkey" FOREIGN KEY ("setId") REFERENCES "flashcard_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "anatomical_structures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_notes" ADD CONSTRAINT "study_notes_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "anatomical_structures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_structures" ADD CONSTRAINT "favorite_structures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_structures" ADD CONSTRAINT "favorite_structures_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "anatomical_structures"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Quem já tinha progresso registrado mantém a data real da primeira visita

UPDATE "user_progress" SET "firstViewed" = "lastViewed";
