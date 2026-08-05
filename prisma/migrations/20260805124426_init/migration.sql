-- CreateTable
CREATE TABLE "TrafficReading" (
    "id" SERIAL NOT NULL,
    "vehicleCount" INTEGER NOT NULL,
    "isCrowded" BOOLEAN NOT NULL,
    "recordedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrafficReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrafficReading_recordedAt_idx" ON "TrafficReading"("recordedAt");
