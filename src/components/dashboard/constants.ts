import type { Range } from "./types";

export const POLL_INTERVAL_MS = 15_000;

export const RANGES: { key: Range; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
];

export const chartConfig = {
  vehicles: { label: "Vehicles", color: "hsl(var(--chart-1))" },
};

export function fmtHour(b: string): string {
  const d = new Date(b);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function fmtDay(b: string): string {
  const d = new Date(b);
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
