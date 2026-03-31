export type WorkoutType = "strength" | "cardio" | "flexibility" | "other";

export type ExerciseCategory =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"
  | "cardio";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  is_default: boolean;
  created_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number | null;
  reps: number | null;
  duration_seconds: number | null;
  notes: string | null;
  order_index: number;
  exercise?: Exercise;
}

export interface Workout {
  id: string;
  title: string;
  type: WorkoutType;
  date: string;
  week_number: number;
  year: number;
  duration_minutes: number | null;
  notes: string | null;
  completed: boolean;
  copied_from: string | null;
  created_at: string;
  workout_exercises?: WorkoutExercise[];
}

export interface Template {
  id: string;
  name: string;
  type: WorkoutType;
  exercises: TemplateExercise[];
  created_at: string;
}

export interface TemplateExercise {
  exercise_id: string;
  sets: number | null;
  reps: number | null;
  duration_seconds: number | null;
}

export interface BodyWeight {
  id: string;
  weight_kg: number;
  date: string;
  created_at: string;
}

export interface Goal {
  id: string;
  month: number;
  year: number;
  target_workout_count: number;
  created_at: string;
}

export type TabId = "home" | "workout" | "galaxy" | "reports" | "profile";
