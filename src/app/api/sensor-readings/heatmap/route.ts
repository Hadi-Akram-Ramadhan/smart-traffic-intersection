import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const since = new Date(Date.now() - 30 * 86400000);

  const readings = await prisma.trafficReading.findMany({
    where: { recordedAt: { gte: since } },
  });

  const counts: { total: number; n: number }[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => ({ total: 0, n: 0 }))
  );

  for (const r of readings) {
    const d = new Date(r.recordedAt);
    const dow = d.getDay();
    const hour = d.getHours();
    counts[dow][hour].total += r.vehicleCount;
    counts[dow][hour].n += 1;
  }

  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (let dow = 0; dow < 7; dow++) {
    for (let hour = 0; hour < 24; hour++) {
      const cell = counts[dow][hour];
      if (cell.n > 0) {
        const avg = cell.total / cell.n;
        grid[dow][hour] = Math.round(avg * 10) / 10;
      }
    }
  }

  const max = Math.max(1, ...grid.flat());

  return NextResponse.json({ grid, max });
}