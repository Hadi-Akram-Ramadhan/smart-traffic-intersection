import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const WIB_OFFSET_MS = 7 * 3_600_000;
function wibDayStart(now: number): Date {
  const wibMs = now + WIB_OFFSET_MS;
  const dayStartUtcMs = Math.floor(wibMs / 86_400_000) * 86_400_000 - WIB_OFFSET_MS;
  return new Date(dayStartUtcMs);
}

function getHourBucket(date: Date): string {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

function getWibDayBucket(date: Date): string {
  const wibMs = date.getTime() + WIB_OFFSET_MS;
  const dayStartUtcMs = Math.floor(wibMs / 86_400_000) * 86_400_000 - WIB_OFFSET_MS;
  return new Date(dayStartUtcMs).toISOString();
}

export async function GET() {
  const now = Date.now();
  const todayStart = wibDayStart(now);
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 6 * 86400000);
  const prevWeekStart = new Date(todayStart.getTime() - 13 * 86400000);
  const monthStart = new Date(todayStart.getTime() - 29 * 86400000);
  const prevMonthStart = new Date(todayStart.getTime() - 59 * 86400000);

  const [allReadings, logs] = await Promise.all([
    prisma.trafficReading.findMany({
      where: { recordedAt: { gte: prevMonthStart } },
      orderBy: { recordedAt: "asc" },
    }),
    prisma.trafficReading.findMany({
      orderBy: { recordedAt: "desc" },
      take: 50,
    }),
  ]);

  const todayMap = new Map<string, { bucket: string; vehicles: number; readings: number; crowded: number }>();
  const prevTodayMap = new Map<string, { bucket: string; vehicles: number; readings: number; crowded: number }>();
  const last7Map = new Map<string, { bucket: string; vehicles: number; readings: number; crowded: number }>();
  const prevLast7Map = new Map<string, { bucket: string; vehicles: number; readings: number; crowded: number }>();
  const last30Map = new Map<string, { bucket: string; vehicles: number; readings: number; crowded: number }>();
  const prevLast30Map = new Map<string, { bucket: string; vehicles: number; readings: number; crowded: number }>();

  for (const r of allReadings) {
    const recDate = new Date(r.recordedAt);
    const time = recDate.getTime();

    if (time >= todayStart.getTime()) {
      const bucket = getHourBucket(recDate);
      const curr = todayMap.get(bucket) || { bucket, vehicles: 0, readings: 0, crowded: 0 };
      curr.vehicles += r.vehicleCount;
      curr.readings += 1;
      if (r.isCrowded) curr.crowded += 1;
      todayMap.set(bucket, curr);
    } else if (time >= yesterdayStart.getTime()) {
      const bucket = getHourBucket(recDate);
      const curr = prevTodayMap.get(bucket) || { bucket, vehicles: 0, readings: 0, crowded: 0 };
      curr.vehicles += r.vehicleCount;
      curr.readings += 1;
      if (r.isCrowded) curr.crowded += 1;
      prevTodayMap.set(bucket, curr);
    }

    if (time >= weekStart.getTime()) {
      const bucket = getWibDayBucket(recDate);
      const curr = last7Map.get(bucket) || { bucket, vehicles: 0, readings: 0, crowded: 0 };
      curr.vehicles += r.vehicleCount;
      curr.readings += 1;
      if (r.isCrowded) curr.crowded += 1;
      last7Map.set(bucket, curr);
    } else if (time >= prevWeekStart.getTime()) {
      const bucket = getWibDayBucket(recDate);
      const curr = prevLast7Map.get(bucket) || { bucket, vehicles: 0, readings: 0, crowded: 0 };
      curr.vehicles += r.vehicleCount;
      curr.readings += 1;
      if (r.isCrowded) curr.crowded += 1;
      prevLast7Map.set(bucket, curr);
    }

    if (time >= monthStart.getTime()) {
      const bucket = getWibDayBucket(recDate);
      const curr = last30Map.get(bucket) || { bucket, vehicles: 0, readings: 0, crowded: 0 };
      curr.vehicles += r.vehicleCount;
      curr.readings += 1;
      if (r.isCrowded) curr.crowded += 1;
      last30Map.set(bucket, curr);
    } else if (time >= prevMonthStart.getTime()) {
      const bucket = getWibDayBucket(recDate);
      const curr = prevLast30Map.get(bucket) || { bucket, vehicles: 0, readings: 0, crowded: 0 };
      curr.vehicles += r.vehicleCount;
      curr.readings += 1;
      if (r.isCrowded) curr.crowded += 1;
      prevLast30Map.set(bucket, curr);
    }
  }

  const todayArr = Array.from(todayMap.values()).sort((a, b) => a.bucket.localeCompare(b.bucket));
  const prevTodayArr = Array.from(prevTodayMap.values()).sort((a, b) => a.bucket.localeCompare(b.bucket));
  const last7Arr = Array.from(last7Map.values()).sort((a, b) => a.bucket.localeCompare(b.bucket));
  const prevLast7Arr = Array.from(prevLast7Map.values()).sort((a, b) => a.bucket.localeCompare(b.bucket));
  const last30Arr = Array.from(last30Map.values()).sort((a, b) => a.bucket.localeCompare(b.bucket));
  const prevLast30Arr = Array.from(prevLast30Map.values()).sort((a, b) => a.bucket.localeCompare(b.bucket));

  const todayTotal = todayArr.reduce((s, r) => s + r.vehicles, 0);

  return NextResponse.json({
    today: todayArr,
    prevToday: prevTodayArr,
    last7: last7Arr,
    prevLast7: prevLast7Arr,
    last30: last30Arr,
    prevLast30: prevLast30Arr,
    logs,
    summary: {
      totalVehiclesToday: todayTotal,
      readingsToday: todayArr.reduce((s, r) => s + r.readings, 0),
      avgVehiclesToday: todayArr.length ? Math.round(todayTotal / todayArr.length) : 0,
    },
  });
}
