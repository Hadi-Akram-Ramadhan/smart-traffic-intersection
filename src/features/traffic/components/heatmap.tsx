"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function cellColor(value: number, max: number) {
  if (value === 0) return "bg-muted/30";
  const t = Math.min(value / max, 1);
  // Green (low) -> Yellow (mid) -> Red (high)
  const r = Math.round(t < 0.5 ? 120 + t * 2 * 135 : 255);
  const g = Math.round(t < 0.5 ? 200 - t * 2 * 80 : 120 - (t - 0.5) * 2 * 120);
  const b = Math.round(t < 0.5 ? 100 : 40);
  return `rgb(${r},${g},${b})`;
}

export function Heatmap() {
  const [grid, setGrid] = useState<number[][] | null>(null);
  const [max, setMax] = useState(1);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/sensor-readings/heatmap")
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (!cancelled) {
          setGrid(d.grid);
          setMax(d.max);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Heatmap</CardTitle>
        <CardDescription>Avg vehicles by hour × day (last 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        {grid === null ? (
          error ? (
            <p className="text-sm text-muted-foreground">Failed to load heatmap.</p>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="p-1" />
                  {Array.from({ length: 24 }, (_, h) => (
                    <th key={h} className="p-1 text-center text-muted-foreground font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, dow) => (
                  <tr key={dow}>
                    <td className="p-1 text-muted-foreground text-right pr-2 whitespace-nowrap">
                      {day}
                    </td>
                    {grid[dow].map((val, h) => (
                      <td
                        key={h}
                        className="p-0.5"
                        title={`${day} ${h}:00 — ${val} vehicles`}
                      >
                        <div
                          className="w-full aspect-square rounded-sm"
                          style={{
                            backgroundColor: cellColor(val, max),
                            opacity: val === 0 ? 0.3 : 0.85,
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}