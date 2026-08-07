"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Prediction = {
  predictedCount: number | null;
  period: string;
  weekday: string;
  nextUpdate: string;
  basis: { days: number; avg: number; unit: string } | null;
};

export function PredictionWidget() {
  const [pred, setPred] = useState<Prediction | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/sensor-readings/predict");
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setPred(json);
      } catch (e) {
        console.error(e);
      }
    }
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>Tomorrow&apos;s Prediction</CardDescription>
        <CardTitle className="text-2xl">
          {pred === null ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : pred.predictedCount === null ? (
            <span className="text-muted-foreground">No data yet</span>
          ) : (
            <>
              {pred.predictedCount}{" "}
              <span className="text-sm font-normal text-muted-foreground">vehicles</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pred?.basis && (
          <p className="text-xs text-muted-foreground">
            Based on {pred.basis.days}-day avg ({Math.round(pred.basis.avg)} {pred.basis.unit})
            <br />
            Next update:{" "}
            {new Date(pred.nextUpdate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}