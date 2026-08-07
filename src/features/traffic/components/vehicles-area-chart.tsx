"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";

import { chartConfig, PEAK_THRESHOLD } from "../constants";
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
  const both = [...data];
  const prev = previousData ?? [];
  const chartData = both.map((r, i) => {
    const p = prev[i];
    return {
      ...r,
      [xKey]: xFormatter(r.bucket),
      previous: p ? p.vehicles : 0,
    };
  });
  const maxVehicles = Math.max(0, ...data.map((r) => r.vehicles));
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