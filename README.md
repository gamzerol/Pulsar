# Pulsar 🌌

A personal fitness tracking app with a galactic reward system. Every completed workout week births a new star, every month adds a new planet to your growing galaxy.

Built with React, TypeScript, Tailwind CSS, and Supabase.

---

## Features

- **Workout Planning** — Create and edit workout plans with exercises, sets, and reps
- **Exercise Library** — Browse 27 default exercises across 7 categories with personal record tracking
- **Templates** — Save workout plans as reusable templates
- **Galaxy Visualization** — Watch your galaxy grow with every completed week and month
- **Reports** — Weekly/monthly charts, top exercises, PR graphs, and body weight tracking
- **Goals** — Set monthly workout targets with progress tracking
- **Year-End Summary** — Export your annual stats as PNG or JSON
- **Quick Copy** — Instantly copy past workouts to today's schedule
- **Streak Tracking** — Keep your training momentum alive

---

## Tech Stack

| Layer     | Technology            |
| --------- | --------------------- |
| Framework | React 18 + TypeScript |
| Styling   | Tailwind CSS          |
| Backend   | Supabase (PostgreSQL) |
| Charts    | Recharts              |
| Icons     | Lucide React          |
| Export    | html2canvas           |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/pulsar.git
cd pulsar
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

Create a free project at [supabase.com](https://supabase.com) and run the following SQL in the SQL Editor:

```sql
create table exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  is_default boolean default true,
  created_at timestamptz default now()
);

create table workouts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type text not null,
  date date not null,
  week_number int not null,
  year int not null,
  duration_minutes int,
  notes text,
  completed boolean default false,
  copied_from uuid references workouts(id),
  created_at timestamptz default now()
);

create table workout_exercises (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references workouts(id) on delete cascade,
  exercise_id uuid references exercises(id),
  sets int,
  reps int,
  duration_seconds int,
  notes text,
  order_index int default 0
);

create table templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null,
  exercises jsonb default '[]',
  created_at timestamptz default now()
);

create table body_weight (
  id uuid default gen_random_uuid() primary key,
  weight_kg numeric not null,
  date date not null,
  created_at timestamptz default now()
);

create table goals (
  id uuid default gen_random_uuid() primary key,
  month int not null,
  year int not null,
  target_workout_count int not null,
  created_at timestamptz default now()
);
```

Then enable Row Level Security with open policies (single-user app):

```sql
do $$
declare
  t text;
begin
  foreach t in array array['workouts','workout_exercises','exercises','templates','body_weight','goals']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "%I_all" on %I for all using (true) with check (true)', t, t);
  end loop;
end $$;
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Start the development server

```bash
npm start
```

Open [https://pulsar-smoky.vercel.app](https://pulsar-smoky.vercel.app) in your browser.

---

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx       # Mobile bottom navigation
│   │   └── Screen.tsx          # Screen & Header wrappers
│   ├── ui/
│   │   ├── index.tsx           # UI primitives (Card, Button, Input...)
│   │   ├── StarBackground.tsx  # Animated star field
│   │   └── Toast.tsx           # Toast notifications
│   └── workout/
│       ├── ExerciseDetailModal.tsx   # Exercise PR history
│       ├── ExercisePickerModal.tsx   # Exercise selector
│       ├── ExerciseRow.tsx           # Set/rep input row
│       ├── TemplatePickerModal.tsx   # Template selector
│       └── WorkoutCard.tsx           # Workout list card
├── lib/
│   ├── AppContext.tsx          # Global state (Context API)
│   ├── supabase.ts             # Supabase client
│   └── utils.ts                # Helper functions
├── pages/
│   ├── GalaxyPage.tsx          # Canvas galaxy visualization
│   ├── HomePage.tsx            # Dashboard & today's workouts
│   ├── LibraryPage.tsx         # Exercise library
│   ├── ProfilePage.tsx         # Goals, body weight & export
│   ├── ReportsPage.tsx         # Charts & statistics
│   ├── WorkoutFormPage.tsx     # Create/edit workout form
│   └── WorkoutPage.tsx         # Workout list
├── types/
│   └── index.ts                # TypeScript interfaces
├── App.tsx
└── index.css                   # Design tokens & animations
```

---

## Galaxy System

The galaxy grows based on your training consistency:

- **Star** — Awarded at the end of each week where at least one workout was completed. Star size reflects workout count, brightness reflects streak length.
- **Planet** — Awarded at the end of each month. Planet size reflects total monthly workout count.

Click any star in the galaxy to see that week's workout details.

---

## Database Schema

```
workouts ──< workout_exercises >── exercises
templates (exercises stored as jsonb)
body_weight
goals
```

---

## Roadmap

- [ ] PWA support (installable on mobile)
- [ ] Push notifications for workout reminders
- [ ] Multi-user support with Supabase Auth
- [ ] Dark/light theme toggle
- [ ] Apple Health / Google Fit integration
