import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  const prisma = new PrismaClient({ adapter });

  const samples = [0, 1, 2, 3, 5, 8];
  for (const n of samples) {
    const r = await prisma.trafficReading.create({
      data: { vehicleCount: n, isCrowded: n > 2 },
    });
    console.log(`count=${n} crowded=${r.isCrowded} recordedAt=${r.recordedAt.toISOString()}`);
  }

  const total = await prisma.trafficReading.count();
  const crowded = await prisma.trafficReading.count({ where: { isCrowded: true } });
  const recent = await prisma.trafficReading.findMany({
    orderBy: { recordedAt: "desc" },
    take: 6,
  });
  console.log(`\nTotal: ${total}, Crowded rows: ${crowded}`);
  console.log("Recent:", recent.map((r) => ({ count: r.vehicleCount, crowded: r.isCrowded })));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
