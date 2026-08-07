---
slug: traffic-frontend-enhancements
status: awaiting-approval
intent: clear
review_required: false
pending-action: write .omo/plans/traffic-frontend-enhancements.md
approach: Incremental frontend enhancement in 7 components across 3 tiers, feature-based architecture preserved, no new dependencies except next-themes for dark mode toggle
---

# Draft: traffic-frontend-enhancements

## Components (topology ledger)

| id | outcome | status | evidence path |
|----|---------|--------|---------------|
| C1 | Dark/Light theme toggle working with shadcn dark vars | active | src/app/globals.css:86-118 (.dark vars exist), layout.tsx |
| C2 | Peak hours indicator highlights busy hours on existing chart | active | src/features/traffic/components/vehicles-area-chart.tsx, stats/route.ts |
| C3 | Trend comparison overlay (today vs yesterday / this week vs last week) | active | src/app/api/sensor-readings/stats/route.ts, dashboard.tsx |
| C4 | Heatmap timeline (hour × day grid, color = vehicle density) | active | stats/route.ts (hourly buckets exist), new component |
| C5 | Prediction widget (display next-hour estimate from backend) | active | new /api/sensor-readings/predict endpoint, new component |
| C6 | Mobile responsive dashboard | active | dashboard.tsx, all feature components |

## Open assumptions (announced defaults)

| assumption | adopted default | rationale | reversible? |
|------------|----------------|-----------|-------------|
| Dark mode library | next-themes (ThemeProvider + class strategy) | shadcn standard, .dark class already defined in globals.css | yes |
| Prediction algorithm | Backend SMA (7-day same-hour moving average) via new `/api/sensor-readings/predict` endpoint | server-side compute, frontend stateless consumer | yes |
| Heatmap rendering | recharts (already installed) with custom cell renderer | no new dependency, recharts supports custom shapes | yes |
| Trend comparison | overlay on same chart (dual Area), not side-by-side | less UI complexity, direct visual comparison | yes |
| Responsive breakpoints | Tailwind default sm/md/lg/xl, mobile-first | standard, already used in dashboard grid | yes |
| Test strategy | tests-after + agent-executed QA per todo | no test framework currently in project | yes |

## Findings (cited - path:lines)

- **Dark vars ready**: globals.css:86-118 has complete `.dark` class with oklch tokens — no new CSS vars needed
- **Chart infra**: recharts v3.8 + shadcn ChartContainer already wired (vehicles-area-chart.tsx) — reuse for heatmap + trend
- **Hourly data exists**: stats/route.ts:30-38 already queries DATE_TRUNC('hour') buckets — heatmap and peak hours can consume this
- **Daily data exists**: stats/route.ts:12-20 DAILY_QUERY for 7d/30d — trend comparison base
- **Single model**: only TrafficReading (id, vehicleCount, isCrowded, recordedAt) — all features derive from this
- **Feature structure**: src/features/traffic/{components,hooks,services,types.ts,constants.ts} — all new components go here
- **Polling 15s**: useTrafficStats.ts polls /api/sensor-readings/stats every 15s — chart/heatmap auto-refresh
- **No auth**: API public, export endpoint needs no auth guard
- **shadcn base-nova**: components.json style=base-nova, @base-ui/react patterns
- **Next.js 16.3**: layout uses LayoutProps<"/">, must follow next docs in node_modules

## Decisions (with rationale)

1. **next-themes for toggle** — 1 small dep, shadcn-standard pattern, .dark class already works
2. **Peak hours = threshold annotations on existing chart** — no new component, just ReferenceLine on AreaChart
3. **Trend = new API endpoint `/api/sensor-readings/stats/compare`** — returns current vs previous period, keeps stats route clean
4. **Heatmap = new component in features/traffic/components/** — uses recharts custom cells, new API endpoint for hourly-by-day matrix
5. **Prediction = client-side SMA calculation** — data already fetched, no backend ML needed
6. **Export = new API route `/api/sensor-readings/export`** — streams CSV, UI button in dashboard header
7. **Responsive = refactor dashboard grid + stack on mobile** — CSS-only changes, no component restructure

## Scope IN

- C1: Dark/light theme toggle (next-themes + button in layout header)
- C2: Peak hours indicator (threshold lines + color zones on area chart)
- C3: Trend comparison (today vs yesterday, 7d vs prev 7d overlay)
- C4: Heatmap timeline (hour × day-of-week intensity grid, 30d data)
- C5: Prediction widget (backend SMA endpoint, frontend display card)
- C6: Mobile responsive (all dashboard components stack properly on mobile)

## Scope OUT (Must NOT have)

- Geographic map (#6) — terpisah, tunggu koordinat
- CSV/PDF export — tidak jadi
- WebSocket/SSE real-time — not in this plan
- Multi-intersection support — not in this plan
- ML/AI prediction models — backend SMA sufficient
- Authentication/authorization
- New database models/migrations — all features use existing TrafficReading
- Alert/notification system

## Open questions

None — all forks resolved via defaults above.

## Approval gate
status: awaiting-approval
approach: 6 components across 3 tiers using existing feature-based architecture, existing recharts + shadcn infra, 1 new dependency (next-themes), new backend predict endpoint, no schema changes
next-action: write .omo/plans/traffic-frontend-enhancements.md
