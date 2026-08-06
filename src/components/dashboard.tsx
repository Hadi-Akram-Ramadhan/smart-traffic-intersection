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
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";

const POLL_INTERVAL_MS = 15_000;

type LogRow = {
  id: number;
  vehicleCount: number;
  isCrowded: boolean;
  recordedAt: string;
};

type RawRow = {
  bucket: string;
  vehicles: number;
  readings: number;
  crowded: number;
};

type StatsResponse = {
  today: RawRow[];
  last7: RawRow[];
  last30: RawRow[];
  logs: LogRow[];
  summary: {
    totalVehiclesToday: number;
    readingsToday: number;
    avgVehiclesToday: number;
  };
};

function fmtBucket(b: string): string {
  const d = new Date(b);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function fmtDay(b: string): string {
  const d = new Date(b);
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const config = {
  vehicles: { label: "Vehicles", color: "hsl(var(--chart-1))" },
  crowded: { label: "Busy", color: "hsl(var(--chart-2))" },
};

export default function Dashboard() {
  const [data, setData] = useState<StatsResponse | null>(null);

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

  const todayData = data.today.map((r) => ({ ...r, bucket: fmtBucket(r.bucket) }));
  const sevenData = data.last7.map((r) => ({ ...r, bucket: fmtDay(r.bucket) }));
  const monthData = data.last30.map((r) => ({ ...r, bucket: fmtDay(r.bucket) }));

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

      {/* Today chart */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicles Today</CardTitle>
          <CardDescription>Vehicles per hour</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config} className="h-72 w-full">
            <BarChart data={todayData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="bucket" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="vehicles" fill="var(--color-vehicles)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 7 days chart */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicles Last 7 Days</CardTitle>
          <CardDescription>Total vehicles per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config} className="h-72 w-full">
            <LineChart data={sevenData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="bucket" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line dataKey="vehicles" stroke="var(--color-vehicles)" strokeWidth={2} type="monotone" dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 30 days chart */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicles Last 30 Days</CardTitle>
          <CardDescription>Total vehicles per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config} className="h-72 w-full">
            <LineChart data={monthData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="bucket" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line dataKey="vehicles" stroke="var(--color-vehicles)" strokeWidth={2} type="monotone" dot={false} />
            </LineChart>
          </ChartContainer>
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