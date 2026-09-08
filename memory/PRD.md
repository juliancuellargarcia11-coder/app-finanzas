# PinkBudget 💗 — PRD

## Overview
Personal finance app in Colombian Pesos (COP), built for iPhone as a native Expo/React Native app **and** installable Progressive Web App. Feminine, elegant, premium pink aesthetic. Local-first storage (AsyncStorage) with a schema designed for future backend migration.

## Tech Stack
- **Frontend**: Expo SDK 57, Expo Router (file-based routing), React Native 0.86, React 19
- **State**: React Context (`AppContext`) + AsyncStorage (`@react-native-async-storage/async-storage`)
- **UI**: `react-native-safe-area-context`, `expo-linear-gradient`, `expo-image`, `expo-haptics`, `react-native-reanimated`, `@react-native-vector-icons/ionicons`
- **PWA**: `/public/manifest.webmanifest`, `/public/sw.js`, runtime `WebHead` injector
- **Design tokens**: `src/theme.ts` (light + dark) driven from `design_guidelines.json`

## Features Implemented (v1)
1. **Dashboard (Inicio)** — greeting, month selector, hero balance card (gradient + image), 50/30/20 budget cards, contextual smart tips.
2. **Movimientos** — month-scoped list, search input, filter chips (Todos / Ingresos / Gastos), grouped by day (Hoy / Ayer / date).
3. **Metas** — savings goals grid with progress bars, target vs saved.
4. **Perfil** — name field, theme toggle (Light / Dark / Auto), budget config shortcut, reset data.
5. **Add Transaction modal** — Gasto/Ingreso toggle, big amount input (auto-formatted COP), 12 expense categories with emojis, income sources, 7 payment methods, notes.
6. **Add Goal modal** — 12 emoji picker, name, target amount, priority (Baja / Media / Alta), notes.
7. **Goal Detail** — hero with big emoji, progress bar, missing/suggested-per-month stats, Añadir ahorro / Retirar, history log, delete.
8. **Budget Config** — 4 presets + manual editors with real-time sum=100 validation.
9. **Toasts** — success/warning/error with haptics.
10. **Permanent history** — every transaction keeps `month` + `year` fields; switching months never wipes data.

## PWA Capabilities
- Manifest with pink theme (`#D81B60`), 192px + 512px maskable icons, `display: standalone`, Spanish (`es-CO`).
- Apple meta tags (`apple-mobile-web-app-capable`, status bar style, title).
- `viewport-fit=cover` for iPhone notch / Dynamic Island safe areas.
- Service worker with app-shell cache + stale-while-revalidate for static assets (no cache on `/api/*`).
- iPhone Safari install banner teaching Share → Add to Home Screen.
- Meta tags injected at runtime by `WebHead` so PWA works in both dev and exported builds.

## Data Model (future-DB-friendly)
Each entity has an `id`, timestamps, and flat columns (no monolithic blob):
- `profile { name, currency, themePref, payday }`
- `budget { needsPct, wantsPct, savingsPct }`
- `transactions[]` — `type: "expense" | "income"`, `amount`, `date`, `description`, `categoryId` / `sourceId`, `paymentMethod`, `notes`, `month`, `year`
- `goals[]` — `name`, `emoji`, `targetAmount`, `savedAmount`, `targetDate`, `priority`, `history[]`

Stored under a single key (`pinkbudget:v1`) but as separate arrays, so a future Supabase / Postgres migration is a table-per-array copy.

## Currency
Colombian Pesos with dots as thousand separator, no decimals — e.g., `$4.000.000`.

## Design
Rose primary `#D81B60`, blush surfaces, deep plum charcoal in dark mode. Fraunces (display) + Manrope (body) — currently falling back to system fonts; can be added later without touching components (`font.display` / `font.body` in theme).

## Testing
- Iteration 1: Dashboard render, Add Transaction (expense + income), persistence across reload, currency formatting — all passed. MonthSelector auto-scroll bug fixed post-test.
- PWA smoke test: manifest, sw.js, icons all serve 200; meta tags injected correctly on runtime.

## Not yet implemented (backlog)
- Recurring transactions & subscriptions
- Debts and credit cards
- Financial calendar
- Statistics with charts
- Export / import CSV / PDF
- Push notifications (requires user to publish + provide `google-services.json`)
- Auth / sync across devices (Supabase)
