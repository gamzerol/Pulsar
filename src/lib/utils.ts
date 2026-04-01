import { WorkoutType, ExerciseCategory } from "../types";

export function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function getWeekNumber(dateStr: string): number {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  );
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

export function getMonthName(month: number): string {
  return new Date(2024, month - 1, 1).toLocaleString("tr-TR", {
    month: "long",
  });
}

export function workoutTypeLabel(type: WorkoutType): string {
  const map: Record<WorkoutType, string> = {
    strength: "Güç",
    cardio: "Kardiyo",
    flexibility: "Esneklik",
    other: "Diğer",
  };
  return map[type];
}

export function categoryLabel(cat: ExerciseCategory): string {
  const map: Record<ExerciseCategory, string> = {
    chest: "Göğüs",
    back: "Sırt",
    legs: "Bacak",
    shoulders: "Omuz",
    arms: "Kol",
    core: "Karın",
    cardio: "Kardiyo",
  };
  return map[cat];
}

export function calculateStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0;
  const uniqueSet = new Set(completedDates);
  const unique: string[] = [];
  uniqueSet.forEach((v) => unique.push(v));
  unique.sort().reverse();
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const d of unique) {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const diff = Math.round((cursor.getTime() - date.getTime()) / 86400000);
    if (diff <= 1) {
      streak++;
      cursor = date;
    } else {
      break;
    }
  }
  return streak;
}

export const WORKOUT_TYPE_COLORS: Record<WorkoutType, string> = {
  strength: "#8b7fff",
  cardio: "#4cc9f0",
  flexibility: "#06d6a0",
  other: "#ffd166",
};

export const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  chest: "#ff6b9d",
  back: "#4cc9f0",
  legs: "#8b7fff",
  shoulders: "#06d6a0",
  arms: "#ffd166",
  core: "#ff9f43",
  cardio: "#ee5a24",
};
