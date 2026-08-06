import type { StatsResponse } from "../types";

export async function fetchTrafficStats(): Promise<StatsResponse> {
  const res = await fetch("/api/sensor-readings/stats");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
