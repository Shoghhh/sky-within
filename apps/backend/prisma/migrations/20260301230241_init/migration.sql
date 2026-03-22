-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthTime" TEXT NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "preferences" JSONB,
    "fcmToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NatalChart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sun" DOUBLE PRECISION NOT NULL,
    "moon" DOUBLE PRECISION NOT NULL,
    "ascendant" DOUBLE PRECISION NOT NULL,
    "mercury" DOUBLE PRECISION,
    "venus" DOUBLE PRECISION,
    "mars" DOUBLE PRECISION,
    "jupiter" DOUBLE PRECISION,
    "saturn" DOUBLE PRECISION,
    "uranus" DOUBLE PRECISION,
    "neptune" DOUBLE PRECISION,
    "pluto" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NatalChart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "message" TEXT NOT NULL,
    "dominantLayer" TEXT NOT NULL,
    "intensity" TEXT NOT NULL,
    "adviceType" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "ruleResult" JSONB,
    "transitData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "DailyMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EphemerisCache" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "positions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EphemerisCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NatalChart_userId_key" ON "NatalChart"("userId");

-- CreateIndex
CREATE INDEX "DailyMessage_userId_idx" ON "DailyMessage"("userId");

-- CreateIndex
CREATE INDEX "DailyMessage_date_idx" ON "DailyMessage"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyMessage_userId_date_key" ON "DailyMessage"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_userId_key" ON "AuthToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EphemerisCache_date_key" ON "EphemerisCache"("date");

-- AddForeignKey
ALTER TABLE "NatalChart" ADD CONSTRAINT "NatalChart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMessage" ADD CONSTRAINT "DailyMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
