import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type RawRow = { bucket: Date; vehicles: bigint | number; readings: bigint | number; crowded: bigint | number };

function toNum(v: bigint | number): number {
  return typeof v === "bigint" ? Number(v) : v;
}

const DAILY_QUERY = (start: Date) => prisma.$queryRaw<RawRow[]>`
  SELECT DATE_TRUNC('day', "recordedAt") AS bucket,
         SUM("vehicleCount")::int AS vehicles,
         COUNT(*)::int AS readings,
         COUNT(*) FILTER (WHERE "isCrowded")::int AS crowded
  FROM "TrafficReading"
  WHERE "recordedAt" >= ${start}
  GROUP BY 1 ORDER BY 1
`;

export async function GET() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(todayStart.getTime() - 6 * 86400000);
  const monthStart = new Date(todayStart.getTime() - 29 * 86400000);

  const [today, last7, last30, logs] = await Promise.all([
    prisma.$queryRaw<RawRow[]>`
      SELECT DATE_TRUNC('hour', "recordedAt") AS bucket,
             SUM("vehicleCount")::int AS vehicles,
             COUNT(*)::int AS readings,
             COUNT(*) FILTER (WHERE "isCrowded")::int AS crowded
      FROM "TrafficReading"
      WHERE "recordedAt" >= ${todayStart}
      GROUP BY 1 ORDER BY 1
    `,
    DAILY_QUERY(weekStart),
    DAILY_QUERY(monthStart),
    prisma.trafficReading.findMany({ orderBy: { recordedAt: "desc" }, take: 50 }),
  ]);

  const todayTotal = (today as RawRow[]).reduce((s, r) => s + toNum(r.vehicles), 0);

  return NextResponse.json({
    today,
    last7,
    last30,
    logs,
    summary: {
      totalVehiclesToday: todayTotal,
      readingsToday: (today as RawRow[]).reduce((s, r) => s + toNum(r.readings), 0),
      avgVehiclesToday: (today as RawRow[]).length ? Math.round(todayTotal / (today as RawRow[]).length) : 0,
    },
  });
}
