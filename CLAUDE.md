# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Dev server at http://localhost:3000
npm run build    # Production build
npm test         # Run tests in watch mode
npm test -- --watchAll=false  # Run tests once (CI mode)
npm test -- -t "test name"    # Run a single test by name
```

## Environment

Requires a `.env` file with:
```
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
```

## Architecture

**Pulsar** is a React 19 + TypeScript fitness tracker using Supabase (PostgreSQL) as the backend. Bootstrapped with Create React App; styled with Tailwind CSS.

### State Management

All global state lives in `src/lib/AppContext.tsx`. The `AppProvider` fetches data from 5 Supabase tables in parallel on mount (`workouts`, `exercises`, `templates`, `body_weight`, `goals`) and exposes them via `useApp()`. Components should consume this hook rather than fetching directly.

### Data Model (`src/types/index.ts`)

- **Workout** — has `type` (strength/cardio/flexibility/other), `date`, `week_number`, `year`, and optionally nested `workout_exercises[]`
- **WorkoutExercise** — join table between workouts and exercises; tracks sets/reps/duration
- **Exercise** — has a `category` (chest/back/legs/shoulders/arms/core/cardio) and `is_default` flag
- **Template** — reusable workout with `TemplateExercise[]` embedded
- **BodyWeight** / **Goal** — simple tracking records

### Utilities (`src/lib/utils.ts`)

All user-facing labels and dates are in **Turkish**. Key helpers:
- `workoutTypeLabel(type)` / `categoryLabel(cat)` — translate enum values to Turkish UI strings
- `formatDate` / `formatShortDate` — Turkish locale date formatting
- `calculateStreak(completedDates)` — consecutive workout day streak
- `WORKOUT_TYPE_COLORS` / `CATEGORY_COLORS` — canonical color maps used for charts (recharts)

### Tab Navigation

`TabId` = `"home" | "workout" | "galaxy" | "reports" | "profile"`. Active tab is controlled via `setActiveTab` in AppContext.

### Supabase Client

Single shared client in `src/lib/supabase.ts`. Use this instance everywhere — do not create additional clients.
