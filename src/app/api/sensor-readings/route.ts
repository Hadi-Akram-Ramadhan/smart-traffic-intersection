import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const vehicleCount = body?.vehicleCount;
  if (typeof vehicleCount !== "number" || vehicleCount < 0 || !Number.isInteger(vehicleCount)) {
    return NextResponse.json(
      { error: "vehicleCount must be a non-negative integer" },
      { status: 400 }
    );
  }

  const reading = await prisma.trafficReading.create({
    data: {
      vehicleCount,
      isCrowded: vehicleCount > 2,
    },
  });

  return NextResponse.json(reading, { status: 201 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);

  const readings = await prisma.trafficReading.findMany({
    orderBy: { recordedAt: "desc" },
    take: limit,
  });

  return NextResponse.json(readings);
}
