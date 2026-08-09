import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const past7 = new Date(now.getTime() - 6 * 86400000);

  const readings = await prisma.trafficReading.findMany({
    where: { recordedAt: { gte: past7 } },
  });

  if (readings.length === 0) {
    return NextResponse.json({ predictedCount: null, basis: null }, { status: 200 });
  }

  const dayMap = new Map<string, { total: number; count: number }>();
  for (const r of readings) {
    const d = new Date(r.recordedAt);
    const dayStr = d.toISOString().split("T")[0];
    const curr = dayMap.get(dayStr) || { total: 0, count: 0 };
    curr.total += r.vehicleCount;
    curr.count += 1;
    dayMap.set(dayStr, curr);
  }

  const dayAvgs = Array.from(dayMap.values()).map((d) => d.total / d.count);
  const avg = dayAvgs.reduce((acc, v) => acc + v, 0) / dayAvgs.length;

  const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
  const nextUpdate = new Date(now.getTime() + 60_000);

  return NextResponse.json({
    predictedCount: Math.round(avg),
    period: "7-day average",
    weekday,
    nextUpdate: nextUpdate.toISOString(),
    basis: {
      days: dayAvgs.length,
      avg,
      unit: "vehicles/day",
    },
  });
}