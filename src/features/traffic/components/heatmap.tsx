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
						<div className="grid w-max gap-0.5 mx-auto">
							<div className="grid grid-cols-[auto_repeat(24,calc(var(--spacing)*4))] gap-0.5 items-end">
								<span className="h-4" />
								{Array.from({ length: 24 }, (_, h) => (
									<span
										key={h}
										className="h-4 text-center text-muted-foreground font-normal leading-4">
										{h}
									</span>
								))}
							</div>
							{DAYS.map((day, dow) => (
								<div key={dow} className="grid grid-cols-[auto_repeat(24,calc(var(--spacing)*4))] gap-0.5 items-center">
									<span className="pr-1 text-xs text-muted-foreground whitespace-nowrap text-right">{day}</span>
									{grid[dow].map((val, h) => (
										<button
											key={h}
											className="size-4 rounded-[2px] p-0"
											style={{
												backgroundColor: cellColor(val, max),
												opacity: val === 0 ? 0.3 : 0.85,
											}}
											title={`${day} ${h}:00 — ${val} vehicles`}
											aria-label={`${day} ${h}:00 — ${val} vehicles`}
										/>
									))}
								</div>
							))}
						</div>

						<div className="mt-3 flex items-center justify-center gap-3">
							<span className="text-[10px] uppercase tracking-wide text-muted-foreground">Low</span>
							{[0.25, 0.5, 0.75, 1].map((t) => (
								<span
									key={t}
									className="inline-block h-3 w-6 rounded-sm"
									style={{
										backgroundColor: cellColor(t * 100, 100),
									}}
								/>
							))}
							<span className="text-[10px] uppercase tracking-wide text-muted-foreground">High</span>
							{/* <span className="ml-2 inline-block h-3 w-3 rounded-sm bg-muted/30" /> */}
							{/* <span className="text-[10px] text-muted-foreground">No data</span> */}
						</div>
						<p className="mt-2 text-center text-xs text-muted-foreground">
							Reflects the average number of vehicles per hour for each day of the week (data from the last 30 days).
							Boxes with higher volumes appear redder.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
