import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = { day: Date; avg: number };

export async function GET() {
  const now = new Date();
  const past7 = new Date(now.getTime() - 6 * 86400000);

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT DATE_TRUNC('day', "recordedAt") AS day,
           AVG("vehicleCount")::float AS avg
    FROM "TrafficReading"
    WHERE "recordedAt" >= ${past7}
    GROUP BY 1
  `;

  if (rows.length === 0) {
    return NextResponse.json({ predictedCount: null, basis: null }, { status: 200 });
  }

  const avg = rows.reduce((acc, r) => acc + r.avg, 0) / rows.length;

  const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
  const nextUpdate = new Date(now.getTime() + 60_000);

  return NextResponse.json({
    predictedCount: Math.round(avg),
    period: "7-day average",
    weekday,
    nextUpdate: nextUpdate.toISOString(),
    basis: {
      days: rows.length,
      avg,
      unit: "vehicles/day",
    },
  });
}