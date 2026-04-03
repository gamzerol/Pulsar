import { useState } from "react";
import { Plus } from "lucide-react";
import { useApp } from "../lib/AppContext";
import { supabase } from "../lib/supabase";
import { Workout } from "../types";
import { today, getWeekNumber } from "../lib/utils";
import { Screen, Header } from "../components/layout/Screen";
import { SectionTitle, EmptyState, Button } from "../components/ui";
import { WorkoutCard } from "../components/workout/WorkoutCard";
import { WorkoutFormPage } from "./WorkoutFormPage";

export function WorkoutPage() {
  const { workouts, refetchWorkouts, refetchAll, showToast } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

  const todayStr = today();

  const filtered = workouts.filter((w) => {
    if (filter === "upcoming") return !w.completed;
    if (filter === "completed") return w.completed;
    return true;
  });

  async function handleComplete(workout: Workout) {
    if (workout.completed) return;
    const { error } = await supabase
      .from("workouts")
      .update({ completed: true })
      .eq("id", workout.id);
    if (!error) {
      await refetchWorkouts();
      showToast("🌟 Antrenman tamamlandı! Yeni bir yıldız doğdu!");
    }
  }

  async function handleDelete(workout: Workout) {
    const { error } = await supabase
      .from("workouts")
      .delete()
      .eq("id", workout.id);
    if (!error) {
      await refetchWorkouts();
      showToast("Antrenman silindi");
    }
  }

  async function handleCopy(workout: Workout) {
    const { data, error } = await supabase
      .from("workouts")
      .insert({
        title: workout.title,
        type: workout.type,
        date: todayStr,
        week_number: getWeekNumber(todayStr),
        year: new Date(todayStr).getFullYear(),
        duration_minutes: workout.duration_minutes,
        notes: workout.notes,
        completed: false,
        copied_from: workout.id,
      })
      .select()
      .single();

    if (error || !data) {
      showToast("Kopyalama başarısız");
      return;
    }

    // Egzersizleri de kopyala
    if (workout.workout_exercises && workout.workout_exercises.length > 0) {
      const copies = workout.workout_exercises.map((we) => ({
        workout_id: data.id,
        exercise_id: we.exercise_id,
        sets: we.sets,
        reps: we.reps,
        duration_seconds: we.duration_seconds,
        notes: we.notes,
        order_index: we.order_index,
      }));
      await supabase.from("workout_exercises").insert(copies);
    }

    await refetchAll();
    showToast("✅ Antrenman bugüne kopyalandı!");
  }

  function handleEdit(workout: Workout) {
    setEditingWorkout(workout);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingWorkout(null);
  }

  if (showForm) {
    return (
      <WorkoutFormPage
        editingWorkout={editingWorkout}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <Screen>
      <Header
        title="Antrenman"
        right={
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              background: "var(--accent)",
              border: "none",
              borderRadius: 99,
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={15} /> Yeni
          </button>
        }
      />

      {/* Filtreler */}
      <div
        className="flex gap-2 hide-scrollbar"
        style={{ overflowX: "auto", padding: "0 16px 4px", marginBottom: 8 }}
      >
        {(
          [
            { value: "all", label: "Tümü" },
            { value: "upcoming", label: "Bekleyenler" },
            { value: "completed", label: "Tamamlananlar" },
          ] as const
        ).map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: "6px 16px",
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 500,
              whiteSpace: "nowrap",
              cursor: "pointer",
              border: `0.5px solid ${filter === f.value ? "var(--accent)" : "var(--border2)"}`,
              background:
                filter === f.value ? "rgba(139,127,255,0.15)" : "transparent",
              color: filter === f.value ? "var(--accent2)" : "var(--text2)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🏋️"
          title="Antrenman bulunamadı"
          description="Yeni bir antrenman oluşturmak için sağ üstteki + butonuna bas."
          action={
            <Button variant="primary" onClick={() => setShowForm(true)}>
              <Plus size={15} /> Antrenman Oluştur
            </Button>
          }
        />
      ) : (
        <>
          <SectionTitle>
            {filter === "all"
              ? `Tüm Antrenmanlar (${filtered.length})`
              : filter === "upcoming"
                ? `Bekleyenler (${filtered.length})`
                : `Tamamlananlar (${filtered.length})`}
          </SectionTitle>
          {filtered.map((w) => (
            <WorkoutCard
              key={w.id}
              workout={w}
              onComplete={handleComplete}
              onEdit={handleEdit}
              onCopy={handleCopy}
              onDelete={handleDelete}
            />
          ))}
        </>
      )}

      <div style={{ height: 20 }} />
    </Screen>
  );
}
