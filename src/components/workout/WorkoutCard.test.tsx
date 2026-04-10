import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { WorkoutCard } from "../../components/workout/WorkoutCard";
import { Workout } from "../../types";

// ─────────────────────────────────────────────
// 📌 KAVRAM: Test fixture (mock data)
// Her testte tekrar yazmak yerine base bir obje tanımla,
// test özelinde sadece değişen alanı override et.
// ─────────────────────────────────────────────

const baseWorkout: Workout = {
  id: "test-1",
  title: "Sabah Antrenmanı",
  type: "strength",
  date: "2024-06-15",
  week_number: 24,
  year: 2024,
  duration_minutes: 45,
  notes: null,
  completed: false,
  copied_from: null,
  created_at: "2024-06-15T08:00:00Z",
  workout_exercises: [],
};

// ─────────────────────────────────────────────
// Temel render testleri
// ─────────────────────────────────────────────

describe("WorkoutCard — temel render", () => {
  it("workout başlığını gösterir", () => {
    render(<WorkoutCard workout={baseWorkout} />);

    expect(screen.getByText("Sabah Antrenmanı")).toBeInTheDocument();
  });

  it("workout tipini Türkçe gösterir", () => {
    render(<WorkoutCard workout={baseWorkout} />);
    expect(screen.getByText("Güç")).toBeInTheDocument();
  });

  it("süreyi gösterir", () => {
    render(<WorkoutCard workout={baseWorkout} />);
    expect(screen.getByText(/45 dk/)).toBeInTheDocument();
  });

  it("egzersiz yoksa 'Egzersiz eklenmedi' gösterir", () => {
    render(<WorkoutCard workout={baseWorkout} />);
    expect(screen.getByText(/Egzersiz eklenmedi/)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// Tamamlanmış workout durumu
// ─────────────────────────────────────────────

describe("WorkoutCard — completed durumu", () => {
  it("completed=true olunca başlık strikethrough'a girer", () => {
    const completedWorkout = { ...baseWorkout, completed: true };
    render(<WorkoutCard workout={completedWorkout} />);

    const title = screen.getByText("Sabah Antrenmanı");
    expect(title).toHaveStyle("text-decoration: line-through");
  });

  it("completed=false olunca strikethrough yok", () => {
    render(<WorkoutCard workout={baseWorkout} />);
    const title = screen.getByText("Sabah Antrenmanı");
    expect(title).toHaveStyle("text-decoration: none");
  });
});

// ─────────────────────────────────────────────
// Egzersiz listesi
// ─────────────────────────────────────────────

describe("WorkoutCard — egzersiz listesi", () => {
  const workoutWithExercises: Workout = {
    ...baseWorkout,
    workout_exercises: [
      {
        id: "we-1",
        workout_id: "test-1",
        exercise_id: "ex-1",
        sets: 4,
        reps: 10,
        duration_seconds: null,
        notes: null,
        order_index: 0,
        exercise: {
          id: "ex-1",
          name: "Bench Press",
          category: "chest",
          is_default: true,
          created_at: "2024-01-01",
        },
      },
      {
        id: "we-2",
        workout_id: "test-1",
        exercise_id: "ex-2",
        sets: 3,
        reps: 12,
        duration_seconds: null,
        notes: null,
        order_index: 1,
        exercise: {
          id: "ex-2",
          name: "Squat",
          category: "legs",
          is_default: true,
          created_at: "2024-01-01",
        },
      },
    ],
  };

  it("egzersiz adlarını gösterir", () => {
    render(<WorkoutCard workout={workoutWithExercises} />);
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(screen.getByText("Squat")).toBeInTheDocument();
  });

  it("egzersiz sayısını gösterir", () => {
    render(<WorkoutCard workout={workoutWithExercises} />);
    expect(screen.getByText(/2 egzersiz/)).toBeInTheDocument();
  });

  it("set × rep bilgisini gösterir", () => {
    render(<WorkoutCard workout={workoutWithExercises} />);
    expect(screen.getByText(/4 set/)).toBeInTheDocument();
    expect(screen.getByText(/10 rep/)).toBeInTheDocument();
  });

  it("4'ten fazla egzersiz varsa '+X daha...' gösterir", () => {
    const manyExercises: Workout = {
      ...baseWorkout,
      workout_exercises: Array.from({ length: 5 }, (_, i) => ({
        id: `we-${i}`,
        workout_id: "test-1",
        exercise_id: `ex-${i}`,
        sets: 3,
        reps: 10,
        duration_seconds: null,
        notes: null,
        order_index: i,
        exercise: {
          id: `ex-${i}`,
          name: `Egzersiz ${i + 1}`,
          category: "chest" as const,
          is_default: true,
          created_at: "2024-01-01",
        },
      })),
    };
    render(<WorkoutCard workout={manyExercises} />);
    expect(screen.getByText(/\+2 daha/)).toBeInTheDocument();
  });
});

describe("WorkoutCard — aksiyon butonları", () => {
  it("Düzenle butonuna tıklanınca onEdit çağrılır", () => {
    const onEdit = jest.fn();
    render(<WorkoutCard workout={baseWorkout} onEdit={onEdit} />);

    fireEvent.click(screen.getByText("Düzenle"));

    expect(onEdit).toHaveBeenCalledWith(baseWorkout);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("Kopyala butonuna tıklanınca onCopy çağrılır", () => {
    const onCopy = jest.fn();
    render(<WorkoutCard workout={baseWorkout} onCopy={onCopy} />);

    fireEvent.click(screen.getByText("Kopyala"));
    expect(onCopy).toHaveBeenCalledWith(baseWorkout);
  });

  it("Sil butonuna tıklanınca onDelete çağrılır", () => {
    const onDelete = jest.fn();
    render(<WorkoutCard workout={baseWorkout} onDelete={onDelete} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]);
    expect(onDelete).toHaveBeenCalledWith(baseWorkout);
  });

  it("Tamamla butonuna tıklanınca onComplete çağrılır", () => {
    const onComplete = jest.fn();
    render(<WorkoutCard workout={baseWorkout} onComplete={onComplete} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onComplete).toHaveBeenCalledWith(baseWorkout);
  });
});
