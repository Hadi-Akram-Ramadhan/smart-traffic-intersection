"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { RANGES, fmtDay, fmtHour } from "../constants";
import { useTrafficStats } from "../hooks/useTrafficStats";
import type { Range } from "../types";
import { ReadingLog } from "./reading-log";
import { VehiclesAreaChart } from "./vehicles-area-chart";

export function Dashboard() {
  const data = useTrafficStats();
  const [range, setRange] = useState<Range>("today");

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
            <CardDescription>Sensor Detect</CardDescription>
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
              <VehiclesAreaChart data={chartData} xKey="hour" xFormatter={fmtHour} />
            ) : (
              <VehiclesAreaChart data={chartData} xKey="day" xFormatter={fmtDay} />
            )}
          </div>
        </CardContent>
      </Card>

      <ReadingLog logs={data.logs} />
    </div>
  );
}
