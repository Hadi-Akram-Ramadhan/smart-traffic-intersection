"use client";

import { useEffect, useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import type { RawRow, Range, StatsResponse } from "./types";
import {
  POLL_INTERVAL_MS,
  RANGES,
  chartConfig,
  fmtHour,
  fmtDay,
  fmtTime,
} from "./constants";

function TodayBarChart({ data }: { data: RawRow[] }) {
  const chartData = data.map((r) => ({ ...r, hour: fmtHour(r.bucket) }));
  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <BarChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="vehicles" fill="var(--color-vehicles)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

function WeekBarChart({ data }: { data: RawRow[] }) {
  const chartData = data.map((r) => ({ ...r, day: fmtDay(r.bucket) }));
  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <BarChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="vehicles" fill="var(--color-vehicles)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

function MonthAreaChart({ data }: { data: RawRow[] }) {
  const chartData = data.map((r) => ({ ...r, day: fmtDay(r.bucket) }));
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
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
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

export default function Dashboard() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [range, setRange] = useState<Range>("today");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/sensor-readings/stats");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        console.error(err);
      }
    }

    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center py-32 text-muted-foreground">
        Loading...
      </div>
    );
  }

  const chartData =
    range === "today" ? data.today : range === "7d" ? data.last7 : data.last30;

  const title =
    range === "today"
      ? "Vehicles Today"
      : range === "7d"
        ? "Vehicles Last 7 Days"
        : "Vehicles Last 30 Days";
  const subtitle =
    range === "today" ? "Vehicles per hour" : "Total vehicles per day";

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Traffic Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Vehicle monitoring at the intersection from IoT sensors
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Vehicles Today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{data.summary.totalVehiclesToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Readings Today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{data.summary.readingsToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Vehicles / Hour</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{data.summary.avgVehiclesToday}</p>
          </CardContent>
        </Card>
      </div>

      {/* Single chart with range selector */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </div>
          <div className="flex gap-1 rounded-lg border bg-muted p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  range === r.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {range === "today" ? (
              <TodayBarChart data={chartData} />
            ) : range === "7d" ? (
              <WeekBarChart data={chartData} />
            ) : (
              <MonthAreaChart data={chartData} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logging */}
      <Card>
        <CardHeader>
          <CardTitle>Reading Log</CardTitle>
          <CardDescription>Latest 50 sensor readings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Vehicle Count</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{fmtTime(log.recordedAt)}</TableCell>
                  <TableCell>{log.vehicleCount}</TableCell>
                  <TableCell>
                    {log.isCrowded ? (
                      <Badge>Busy</Badge>
                    ) : (
                      <Badge variant="secondary">Quiet</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
