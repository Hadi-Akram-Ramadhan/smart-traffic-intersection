import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
// @ts-ignore
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makeClient() {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  const filePath = url.replace(/^file:/, "");

  try {
    const dir = path.dirname(filePath);
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const sqlite = new Database(filePath);
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS "TrafficReading" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "vehicleCount" INTEGER NOT NULL,
        "isCrowded" BOOLEAN NOT NULL,
        "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "TrafficReading_recordedAt_idx" ON "TrafficReading"("recordedAt");
    `);
    sqlite.close();
  } catch (e) {
    console.error("Failed to auto-init SQLite database table:", e);
  }

  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

