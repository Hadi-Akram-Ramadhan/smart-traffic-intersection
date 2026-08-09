// Seed script: insert readings spread across today, last 7 days, last 30 days.
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

const DAY = 24 * 60 * 60 * 1000;
const now = new Date();

const rows: { vehicleCount: number; isCrowded: boolean; recordedAt: Date }[] = [];

for (let h = 0; h < 24; h++) {
  const t = new Date(now);
  t.setHours(h, 30, 0, 0);
  if (t > now) continue;
  const peak = (h >= 7 && h <= 9) || (h >= 16 && h <= 18);
  const count = peak ? 15 + Math.floor(Math.random() * 15) : 2 + Math.floor(Math.random() * 8);
  rows.push({ vehicleCount: count, isCrowded: count > 2, recordedAt: t });
}

for (let d = 1; d <= 7; d++) {
  const t = new Date(now.getTime() - d * DAY);
  t.setHours(12, 0, 0, 0);
  const count = 60 + Math.floor(Math.random() * 60);
  rows.push({ vehicleCount: count, isCrowded: true, recordedAt: t });
}

for (let d = 8; d <= 30; d++) {
  const t = new Date(now.getTime() - d * DAY);
  t.setHours(12, 0, 0, 0);
  const count = 40 + Math.floor(Math.random() * 80);
  rows.push({ vehicleCount: count, isCrowded: count > 50, recordedAt: t });
}

await prisma.trafficReading.createMany({ data: rows });
console.log(`Seeded ${rows.length} readings`);

await prisma.$disconnect();
