import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { WorkoutCard } from "../components/workout/WorkoutCard";

const meta: Meta<typeof WorkoutCard> = {
  title: "Workout/WorkoutCard",
  component: WorkoutCard,
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#2a2a74" }],
    },
  },
};

export default meta;
type Story = StoryObj<typeof WorkoutCard>;

const baseWorkout = {
  id: "1",
  title: "Göğüs & Triseps",
  type: "strength" as const,
  date: "2025-04-08",
  week_number: 15,
  year: 2025,
  duration_minutes: 60,
  notes: null,
  completed: false,
  copied_from: null,
  created_at: new Date().toISOString(),
  workout_exercises: [
    {
      id: "we1",
      workout_id: "1",
      exercise_id: "ex1",
      sets: 4,
      reps: 10,
      duration_seconds: null,
      notes: null,
      order_index: 0,
      exercise: {
        id: "ex1",
        name: "Bench Press",
        category: "chest" as const,
        is_default: true,
        created_at: new Date().toISOString(),
      },
    },
    {
      id: "we2",
      workout_id: "1",
      exercise_id: "ex2",
      sets: 3,
      reps: 12,
      duration_seconds: null,
      notes: null,
      order_index: 1,
      exercise: {
        id: "ex2",
        name: "Tricep Dip",
        category: "arms" as const,
        is_default: true,
        created_at: new Date().toISOString(),
      },
    },
  ],
};

export const Pending: Story = {
  args: {
    workout: baseWorkout,
    onComplete: (w: any) => console.log("complete", w),
    onEdit: (w: any) => console.log("edit", w),
    onCopy: (w: any) => console.log("copy", w),
    onDelete: (w: any) => console.log("delete", w),
  },
};

export const Completed: Story = {
  args: {
    workout: { ...baseWorkout, completed: true },
  },
};

export const Cardio: Story = {
  args: {
    workout: {
      ...baseWorkout,
      title: "Sabah Koşusu",
      type: "cardio" as const,
      workout_exercises: [],
    },
  },
};

export const NoExercises: Story = {
  args: {
    workout: {
      ...baseWorkout,
      workout_exercises: [],
    },
  },
};
