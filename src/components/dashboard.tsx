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
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartJSTooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartJSTooltip);

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

type Range = "today" | "7d" | "30d";

const RANGES: { key: Range; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
];

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

const rechartsConfig = {
  vehicles: { label: "Vehicles", color: "hsl(var(--chart-1))" },
};

function TodayBarChart({ data }: { data: RawRow[] }) {
  return (
    <Bar
      data={{
        labels: data.map((r) => fmtBucket(r.bucket)),
        datasets: [
          {
            label: "Vehicles",
            data: data.map((r) => r.vehicles),
            backgroundColor: "oklch(0.546 0.245 262.881)",
            borderRadius: 4,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "hsl(var(--muted))" } },
        },
      }}
    />
  );
}

function DailyLineChart({ data }: { data: RawRow[] }) {
  const chartData = data.map((r) => ({ ...r, bucket: fmtDay(r.bucket) }));
  return (
    <ChartContainer config={rechartsConfig} className="h-72 w-full">
      <LineChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="bucket" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          dataKey="vehicles"
          stroke="var(--color-vehicles)"
          strokeWidth={2}
          type="monotone"
          dot={false}
        />
      </LineChart>
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
            ) : (
              <DailyLineChart data={chartData} />
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