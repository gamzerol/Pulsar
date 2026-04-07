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

### Pages (`src/pages/`)

Each tab renders a dedicated page component:
- `HomePage.tsx` — dashboard with greeting and connection status
- `WorkoutPage.tsx` — workout list with add/edit entry points
- `WorkoutFormPage.tsx` — form for creating/editing a workout
- `GalaxyPage.tsx` — galaxy tab page
- `LibraryPage.tsx` — exercise library (not currently bound to a tab)
- `ReportsPage.tsx` — reports tab page

### Layout Components (`src/components/layout/`)

- `BottomNavs.tsx` — fixed bottom tab bar rendering all 5 tabs; reads `activeTab` / `setActiveTab` from AppContext
- `Screen.tsx` — scrollable content wrapper with bottom padding; also exports `Header` (sticky page header with `title`, optional `titleAccent`, `subtitle`, and `right` slot)

### Workout Components (`src/components/workout/`)

- `WorkoutCard.tsx` — single workout summary card
- `ExerciseRow.tsx` — exercise entry row within a workout form
- `ExercisePickerModal.tsx` — modal for selecting exercises from the library
- `ExerciseDetailModal.tsx` — modal showing detailed info for a single exercise
- `TemplatePickerModal.tsx` — modal for selecting a workout template

### UI Primitives (`src/components/ui/`)

- `index.tsx` — shared design-system components: `Card`, `Button` (variants: primary/secondary/ghost/danger; sizes: sm/md/lg), `SectionTitle`, `StatCard`, `EmptyState`, `Badge`, `Input`, `Select`, `Textarea`
- `StarBackground.tsx` — animated star-field fixed behind all content (z-0, pointer-events-none)
- `Toast.tsx` — temporary notification overlay; driven by `toast` / `clearToast` in AppContext, auto-dismisses after 2.8 s

### Supabase Client

Single shared client in `src/lib/supabase.ts`. Use this instance everywhere — do not create additional clients.
