"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";

import { chartConfig, PEAK_THRESHOLD, fmtHour } from "../constants";
import type { RawRow } from "../types";

export function VehiclesAreaChart({
  data,
  previousData,
  xKey,
  xFormatter,
}: {
  data: RawRow[];
  previousData?: RawRow[];
  xKey: "hour" | "day";
  xFormatter: (b: string) => string;
}) {
  const prev = previousData ?? [];

  // Hourly view: fill all 24 slots (zeros for empty hours) so a single
  // bucket still renders a full visible line instead of a lone dot.
  type $Point = RawRow & { previous: number; hour?: string; day?: string };
  const filledHourly: $Point[] = Array.from({ length: 24 }, (_, h) => {
    const byHour = new Map(data.map((r) => [new Date(r.bucket).getHours(), r]));
    const prevByHour = new Map(prev.map((r) => [new Date(r.bucket).getHours(), r]));
    const r = byHour.get(h);
    const p = prevByHour.get(h);
    return {
      bucket: r?.bucket ?? new Date(2026, 0, 1, h).toISOString(),
      vehicles: r?.vehicles ?? 0,
      readings: r?.readings ?? 0,
      crowded: r?.crowded ?? 0,
      hour: fmtHour(new Date(2026, 0, 1, h).toISOString()),
      previous: p?.vehicles ?? 0,
    };
  });

  const chartData = (xKey === "hour" ? filledHourly : data.map((r, i) => {
          const p = prev[i];
          return {
            ...r,
            day: xFormatter(r.bucket),
            previous: p ? p.vehicles : 0,
          };
        })) as $Point[];

  const maxVehicles = Math.max(0, ...chartData.map((r) => r.vehicles));
  const yDomain = [0, Math.max(maxVehicles + 20, PEAK_THRESHOLD * 2)] as [number, number];
  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <AreaChart data={chartData} accessibilityLayer>
        <defs>
          <linearGradient id="fillVehicles" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-vehicles)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-vehicles)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={40} domain={yDomain} />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <ReferenceLine
          y={PEAK_THRESHOLD}
          stroke="hsl(var(--destructive))"
          strokeDasharray="6 4"
          strokeWidth={2}
          label={{
            value: `Peak (${PEAK_THRESHOLD})`,
            position: "right",
            fill: "hsl(var(--destructive))",
            fontSize: 11,
          }}
        />
        {prev.length > 0 && (
          <Area
            dataKey="previous"
            type="natural"
            stroke="var(--color-previous)"
            strokeDasharray="4 4"
            fill="none"
            strokeWidth={1.5}
            dot={false}
          />
        )}
        <Area
          dataKey="vehicles"
          type="natural"
          fill="url(#fillVehicles)"
          stroke="var(--color-vehicles)"
        />
      </AreaChart>
    </ChartContainer>
  );
}