import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

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
