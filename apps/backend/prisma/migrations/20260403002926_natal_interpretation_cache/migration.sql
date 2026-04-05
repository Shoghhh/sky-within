-- CreateTable
CREATE TABLE "NatalInterpretationCache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "personalityProse" TEXT NOT NULL,
    "openAiPatch" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NatalInterpretationCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NatalInterpretationCache_userId_key" ON "NatalInterpretationCache"("userId");

-- AddForeignKey
ALTER TABLE "NatalInterpretationCache" ADD CONSTRAINT "NatalInterpretationCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
