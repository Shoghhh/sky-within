-- Per-language rows; chart geometry keyed by chartInputHash (language excluded from hash).
TRUNCATE TABLE "NatalInterpretationCache";

ALTER TABLE "NatalInterpretationCache" DROP CONSTRAINT IF EXISTS "NatalInterpretationCache_userId_key";

DROP INDEX IF EXISTS "NatalInterpretationCache_userId_key";

ALTER TABLE "NatalInterpretationCache" DROP COLUMN IF EXISTS "inputHash";

ALTER TABLE "NatalInterpretationCache" ADD COLUMN IF NOT EXISTS "chartInputHash" TEXT NOT NULL;
ALTER TABLE "NatalInterpretationCache" ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL;

CREATE UNIQUE INDEX "NatalInterpretationCache_userId_chartInputHash_language_key" ON "NatalInterpretationCache"("userId", "chartInputHash", "language");

CREATE INDEX "NatalInterpretationCache_userId_idx" ON "NatalInterpretationCache"("userId");
