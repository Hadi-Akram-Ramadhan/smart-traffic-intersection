# traffic-frontend-enhancements - Work Plan

## TL;DR (For humans)

**What you'll get:** A fully responsive traffic dashboard with dark/light theme toggle, peak hours visualization, trend comparison overlay, 30-day intensity heatmap, backend-driven prediction widget, and mobile-optimized layout—all integrated into the existing feature-based architecture.

**Why this approach:** Leverages existing recharts + shadcn infrastructure, adds only 1 lightweight dependency (next-themes), keeps data layer in backend (SMA prediction compute), and stages work in 3 dependency-aware waves so frontend and backend can parallelize. No schema changes, no breaking changes.

**What it will NOT do:** Geographic map (separate plan pending coordinates), CSV/PDF export, WebSocket streams, multi-intersection support, database migrations, authentication.

**Effort:** Medium (7 focused todos across 2-3 days with parallel waves)
**Risk:** Low - all APIs already exist (stats endpoint), theme vars ready, recharts proven pattern
**Decisions to sanity-check:** next-themes lib choice (standard for shadcn), backend SMA for prediction (no frontend compute), no export feature (defer), heatmap using recharts cells (no new charting lib)

Your next move: Approve the plan, then `/start-work` to execute. Full execution detail follows below.

---

> TL;DR (machine): 6 frontend features (theme, peak hours, trend, heatmap, prediction, responsive) + 1 backend endpoint (SMA predict), 7 todos, Medium effort, Low risk, no schema changes, leverages existing infra.

## Scope
### Must have
- C1: Dark/light theme toggle (next-themes + UI button)
- C2: Peak hours indicator (ReferenceLine + coloring on area chart)
- C3: Trend comparison (dual Area overlay - current vs previous period)
- C4: Heatmap timeline (hour × day-of-week grid, 30d intensity)
- C5: Prediction widget (display backend-computed next-hour estimate)
- C6: Mobile responsive (all components stack on mobile, grid → vertical)

### Must NOT have (guardrails, anti-slop, scope boundaries)
- Geographic map (defer to separate plan)
- CSV/PDF export
- WebSocket/real-time streams
- Multi-intersection support
- Database schema changes
- Authentication/authorization

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after + manual QA per todo (no test framework in project; agent runs build + browser check)
- Evidence: `.omo/evidence/traffic-frontend-enhancements/` per task

## Execution strategy
### Parallel execution waves

**Wave 1 (Tier 1 - Foundation):** C1 + C2 setup — theme infra + chart prep
**Wave 2 (Tier 2 - Enhancement):** C3 + backend predict endpoint — API + UI
**Wave 3 (Tier 3 - Polish):** C4 + C5 + C6 — heatmap + prediction display + responsive

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
|------|-----------|--------|----------------------|
| 1. Setup next-themes + button | — | 2, all | — |
| 2. Peak hours on chart | 1 | 3 | — |
| 3. Trend comparison UI | 2 | 4 | — |
| 4. Backend predict endpoint | — | 5 | 1, 2, 3 |
| 5. Prediction widget | 4 | 6 | — |
| 6. Heatmap component | 1, 2 | 7 | 5 |
| 7. Mobile responsive | 6 | — | — |

## Todos
> Implementation + Test = ONE todo. Never separate.

### Wave 1: Theme infrastructure + Chart foundation

- [ ] 1. Install next-themes, add ThemeProvider, expose theme toggle button in layout header
  What to do: (1) `npm install next-themes`, (2) wrap RootLayout with ThemeProvider (client component), (3) add useTheme hook to layout header, (4) button toggles dark class on <html>, (5) verify dark/light colors switch on click
  Parallelization: Wave 1 | Blocked by: none | Blocks: 2, all downstream
  References: `src/app/layout.tsx:20-30`, `src/app/globals.css:86-118` (dark vars ready), `package.json` (deps)
  Acceptance criteria: (1) `npm list next-themes` shows installed, (2) layout renders ThemeProvider wrapper, (3) toggle button visible in header, (4) clicking button adds/removes `.dark` class, (5) recharts chart colors change per dark mode
  QA scenarios: 
    - Happy: `npm run dev`, load page, click toggle, verify bg switches from white to dark (#09090b), text switches light/dark
    - Failure: toggle doesn't exist or doesn't add `.dark` class → check layout useTheme import
  Commit: Y | feat(ui): add next-themes dark mode toggle

- [ ] 2. Add ReferenceLine + threshold coloring to vehicles-area-chart for peak hours
  What to do: (1) identify peak hours (>50 vehicles/hour threshold), (2) add ReferenceLine(s) to AreaChart, (3) add custom color zones or dashed lines, (4) update chartConfig with peak color
  Parallelization: Wave 1 | Blocked by: 1 (theme ready for colors) | Blocks: 3
  References: `src/features/traffic/components/vehicles-area-chart.tsx:20-40`, `src/features/traffic/constants.ts:11-13` (chartConfig), `src/app/api/sensor-readings/stats/route.ts:30-38` (hourly data has vehicles field)
  Acceptance criteria: (1) ReferenceLine renders at y=50, (2) line color = chart-2 (amber/warning), (3) areas below 50 = normal color, above = alert color, (4) dashed appearance for visual distinction
  QA scenarios:
    - Happy: load dashboard, chart shows horizontal line at 50, colors change above threshold
    - Failure: line doesn't render or threshold not visible → check ReferenceLine props (yAxisId, stroke, strokeDasharray)
  Commit: Y | feat(chart): add peak hours threshold line

### Wave 2: Trend comparison + Backend predict

- [ ] 3. Add dual Area overlay (current vs previous period) to dashboard chart
  What to do: (1) add range selector for comparison (today vs yesterday, 7d vs prev-7d), (2) modify chart to render two Areas (current + previous), (3) different colors/opacity, (4) update legend to label both
  Parallelization: Wave 2 | Blocked by: 2 (chart foundation ready) | Blocks: none
  References: `src/features/traffic/components/dashboard.tsx:45-85` (range state, chart render), `src/features/traffic/constants.ts:5-9` (RANGES), `vehicles-area-chart.tsx:9-40` (AreaChart structure)
  Acceptance criteria: (1) new toggle "Compare with" appears, (2) selecting "yesterday" fetches prev-day data, (3) chart renders two Areas with different colors, (4) legend shows both lines, (5) areas don't overlap visually (use opacity 0.5 for previous)
  QA scenarios:
    - Happy: toggle "Compare with yesterday", see second lighter Area overlay, hovering tooltip shows both values
    - Failure: second data not fetched or Area doesn't render → check chartData mapping includes both datasets
  Commit: Y | feat(chart): add trend comparison overlay

- [ ] 4. Create backend API endpoint `/api/sensor-readings/predict` that computes 7-day SMA for next hour
  What to do: (1) new file `src/app/api/sensor-readings/predict/route.ts`, (2) GET handler: compute 7-day same-hour moving average from TrafficReading, (3) return `{ nextHourEstimate: number, confidence: string }`, (4) handle edge cases (< 7 days data = low confidence)
  Parallelization: Wave 2 | Blocked by: none | Blocks: 5
  References: `src/app/api/sensor-readings/stats/route.ts:12-42` (query pattern, toNum helper), `prisma/schema.prisma:13-19` (TrafficReading model), `src/features/traffic/types.ts` (add PredictionResponse type)
  Acceptance criteria: (1) endpoint returns 200 + JSON, (2) SMA = average vehicleCount for same hour across last 7 days, (3) confidence high if >= 7 days data, low if < 7 days, (4) handles empty data gracefully
  QA scenarios:
    - Happy: `curl http://localhost:3000/api/sensor-readings/predict`, returns `{ nextHourEstimate: 45, confidence: "high" }`
    - Failure: query returns null or NaN → check DATE_TRUNC('hour'), EXTRACT(HOUR) logic
  Commit: Y | feat(api): add traffic prediction endpoint (SMA)

### Wave 3: Heatmap + Prediction widget + Mobile

- [ ] 5. Create prediction widget component to display backend estimate with trend icon
  What to do: (1) new file `src/features/traffic/components/prediction-widget.tsx`, (2) fetch `/api/sensor-readings/predict`, (3) render Card with next-hour estimate + trend (↑ if > today average, ↓ if <), (4) show confidence badge, (5) auto-refresh on dashboard poll
  Parallelization: Wave 3 | Blocked by: 4 (predict endpoint ready) | Blocks: 6 (layout integration)
  References: `src/features/traffic/components/reading-log.tsx:8-45` (Card + Badge pattern), `src/features/traffic/hooks/useTrafficStats.ts:9-32` (polling pattern), `src/features/traffic/constants.ts:1-3` (POLL_INTERVAL)
  Acceptance criteria: (1) component renders Card, (2) estimate displays prominently, (3) confidence badge shows high/low, (4) trend icon updates per data, (5) respects 15s poll interval
  QA scenarios:
    - Happy: dashboard loads, prediction widget shows estimate + trend, refreshes every 15s
    - Failure: fetch fails or component unmounts → check error handling, dependency array in useEffect
  Commit: Y | feat(components): add prediction widget

- [ ] 6. Create heatmap component (hour × day-of-week grid) showing 30d intensity
  What to do: (1) new file `src/features/traffic/components/heatmap-timeline.tsx`, (2) fetch 30d hourly data from stats endpoint, (3) organize into hour (0-23) × day (0-6) matrix, (4) render recharts custom cell grid (color = intensity), (5) legend shows scale from low (green) to high (red)
  Parallelization: Wave 3 | Blocked by: 2 (theme colors ready), 4 (data ready) | Blocks: 7
  References: `src/features/traffic/components/vehicles-area-chart.tsx:3-40` (recharts pattern, ChartContainer), `src/app/api/sensor-readings/stats/route.ts:39` (last30 query), add HeatmapData type to `src/features/traffic/types.ts`
  Acceptance criteria: (1) grid renders 24 rows (hours) × 7 cols (days), (2) cell color maps to vehicle count (0=green, 100+=red), (3) tooltip on hover shows hour, day, vehicle count, (4) responsive: shrink on mobile
  QA scenarios:
    - Happy: dashboard displays heatmap, hover cell shows "Monday 14:00 - 67 vehicles"
    - Failure: data not organized or colors don't scale → check hour extraction and min/max normalization
  Commit: Y | feat(components): add heatmap timeline

- [ ] 7. Make dashboard + all components mobile responsive (grid → stack, font sizing, touch-friendly)
  What to do: (1) refactor dashboard grid from `grid-cols-3` to `sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, (2) adjust KPI cards font size on mobile, (3) chart height responsive (h-72 on desktop, h-48 on mobile), (4) heatmap scales or scrolls horizontally on mobile, (5) prediction widget full-width on mobile
  Parallelization: Wave 3 | Blocked by: 6 (all components built) | Blocks: none
  References: `src/features/traffic/components/dashboard.tsx:36-112` (grid, layout), Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)
  Acceptance criteria: (1) `npm run dev`, browser DevTools mobile view (375px), all text readable, (2) no horizontal scroll except heatmap, (3) cards stack vertically, (4) buttons clickable (48px min touch target), (5) chart height appropriate
  QA scenarios:
    - Happy: DevTools mobile mode, swipe/scroll smoothly, all components visible
    - Failure: text too small or overlapping → increase font sizes, adjust spacing
  Commit: Y | feat(responsive): mobile-first dashboard layout

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit — verify all 7 todos reference files + acceptance + QA + commits
- [ ] F2. Code quality review — ESLint, type safety, no console errors
- [ ] F3. Real manual QA — load page on desktop + mobile, toggle theme, interact with all components
- [ ] F4. Scope fidelity — all 6 features (C1-C6) working, no scope creep

## Commit strategy

Each todo commits after completion. Conventional Commits format:
- **feat(ui):** theme, toggle, layout changes
- **feat(chart):** recharts modifications, visual enhancements
- **feat(api):** backend endpoints
- **feat(components):** new components
- **feat(responsive):** mobile/layout work

All commits go to feature branch (or main if no branch discipline). No squash — 7 logical commits for 7 todos.

## Success criteria

1. Dark/light toggle works — clicking button adds/removes `.dark` class, all colors update
2. Peak hours visible — ReferenceLine at threshold, distinct coloring above 50 vehicles/hour
3. Trend comparison renders — dual Areas visible, legend shows both periods, selector works
4. Prediction endpoint operational — `/api/sensor-readings/predict` returns valid JSON
5. Prediction widget displays — shows next-hour estimate + confidence + trend icon
6. Heatmap renders — 24×7 grid visible, colors scale by intensity, tooltip works
7. Mobile responsive — DevTools mobile view shows stacked layout, all components readable
8. All components styled with dark mode — both light and dark themes functional
9. No errors in console — build succeeds, no TypeScript errors
10. Plan compliance — all 7 todos executed, final verification wave passes
