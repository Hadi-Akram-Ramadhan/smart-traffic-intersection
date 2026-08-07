import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = { dow: number; hour: number; avg: number };

export async function GET() {
  const since = new Date(Date.now() - 30 * 86400000);

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT EXTRACT(DOW FROM "recordedAt")::int AS dow,
           EXTRACT(HOUR FROM "recordedAt")::int AS hour,
           AVG("vehicleCount")::float AS avg
    FROM "TrafficReading"
    WHERE "recordedAt" >= ${since}
    GROUP BY 1, 2
  `;

  // grid[dow][hour] = avg vehicles
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const r of rows) {
    grid[r.dow][r.hour] = Math.round(r.avg * 10) / 10;
  }

  const max = Math.max(1, ...grid.flat());

  return NextResponse.json({ grid, max });
}