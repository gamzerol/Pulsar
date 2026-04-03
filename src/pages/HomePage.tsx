import { useState, useEffect } from "react";
import { X, Plus, Copy, CheckCircle } from "lucide-react";
import { useApp } from "../lib/AppContext";
import { supabase } from "../lib/supabase";
import { Workout } from "../types";
import {
  today,
  formatDate,
  formatShortDate,
  calculateStreak,
  getWeekNumber,
  workoutTypeLabel,
} from "../lib/utils";
import { Screen, Header } from "../components/layout/Screen";
import { SectionTitle, StatCard, EmptyState, Button } from "../components/ui";

export function HomePage() {
  const { workouts, refetchWorkouts, refetchAll, showToast, setActiveTab } =
    useApp();
  const [showNotif, setShowNotif] = useState(false);
  const todayStr = today();
  const now = new Date();

  const todayWorkouts = workouts.filter((w) => w.date === todayStr);
  const pendingToday = todayWorkouts.filter((w) => !w.completed);

  const streak = calculateStreak(
    workouts.filter((w) => w.completed).map((w) => w.date),
  );

  const monthCount = workouts.filter((w) => {
    const d = new Date(w.date);
    return (
      w.completed &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  const total = workouts.filter((w) => w.completed).length;

  // Son tamamlanan antrenman (kopyalamak için)
  const lastCompleted = workouts.find((w) => w.completed);

  useEffect(() => {
    if (pendingToday.length > 0) setShowNotif(true);
  }, [pendingToday.length]);

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

  async function handleCopyLast() {
    if (!lastCompleted) return;
    const { data, error } = await supabase
      .from("workouts")
      .insert({
        title: lastCompleted.title,
        type: lastCompleted.type,
        date: todayStr,
        week_number: getWeekNumber(todayStr),
        year: new Date(todayStr).getFullYear(),
        duration_minutes: lastCompleted.duration_minutes,
        notes: null,
        completed: false,
        copied_from: lastCompleted.id,
      })
      .select()
      .single();

    if (error || !data) {
      showToast("Kopyalama başarısız");
      return;
    }

    if (lastCompleted.workout_exercises?.length) {
      const copies = lastCompleted.workout_exercises.map((we) => ({
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
    showToast("✅ Son antrenman bugüne kopyalandı!");
  }

  return (
    <Screen>
      <Header
        title="Merhaba,"
        titleAccent="Gamze"
        subtitle={formatDate(todayStr)}
      />

      {/* Bildirim banner */}
      {showNotif && pendingToday.length > 0 && (
        <div
          className="animate-slide-down"
          style={{
            margin: "0 16px 12px",
            background: "rgba(255,209,102,0.08)",
            border: "0.5px solid rgba(255,209,102,0.25)",
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20 }}>🌟</span>
          <span
            style={{
              flex: 1,
              fontSize: 13,
              color: "var(--gold)",
              lineHeight: 1.5,
            }}
          >
            {pendingToday.length} antrenmanın seni bekliyor! Bir yıldız doğmayı
            bekliyor.
          </span>
          <button
            onClick={() => setShowNotif(false)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text3)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* İstatistikler */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          padding: "0 16px",
          marginBottom: 10,
        }}
      >
        <StatCard value={total} label="Toplam antrenman" />
        <StatCard
          value={monthCount}
          label={now.toLocaleString("tr-TR", { month: "long" }) + " ayı"}
        />
      </div>

      {/* Streak */}
      <div style={{ padding: "0 16px", marginBottom: 16 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background:
              streak > 0 ? "rgba(255,209,102,0.1)" : "rgba(255,255,255,0.04)",
            border: `0.5px solid ${streak > 0 ? "rgba(255,209,102,0.25)" : "var(--border)"}`,
            borderRadius: 99,
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 600,
            color: streak > 0 ? "var(--gold)" : "var(--text3)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: streak > 0 ? "var(--gold)" : "var(--text3)",
              display: "inline-block",
              animation:
                streak > 0 ? "pulseDot 1.5s ease-in-out infinite" : "none",
            }}
          />
          {streak > 0 ? `${streak} günlük seri 🔥` : "Henüz seri yok"}
        </div>
      </div>

      {/* Bugünün antrenmanları */}
      <SectionTitle>Bugün</SectionTitle>

      {todayWorkouts.length === 0 ? (
        <EmptyState
          icon="🚀"
          title="Bugün plan yok"
          description="Yeni bir antrenman planla veya son antrenmanını kopyala."
          action={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "center",
              }}
            >
              <Button variant="primary" onClick={() => setActiveTab("workout")}>
                <Plus size={15} /> Antrenman Planla
              </Button>
              {lastCompleted && (
                <Button variant="ghost" onClick={handleCopyLast}>
                  <Copy size={15} /> Son Antrenmanı Kopyala
                </Button>
              )}
            </div>
          }
        />
      ) : (
        todayWorkouts.map((w) => (
          <TodayWorkoutCard
            key={w.id}
            workout={w}
            onComplete={handleComplete}
          />
        ))
      )}

      {/* Son antrenman kopyala */}
      {lastCompleted && todayWorkouts.length > 0 && (
        <>
          <SectionTitle>Hızlı Erişim</SectionTitle>
          <div style={{ padding: "0 16px" }}>
            <button
              onClick={handleCopyLast}
              style={{
                width: "100%",
                padding: "13px 16px",
                background: "var(--surface)",
                border: "0.5px solid var(--border2)",
                borderRadius: 12,
                color: "var(--text2)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                textAlign: "left",
              }}
            >
              <Copy size={16} color="var(--accent2)" />
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  Son antrenmanı kopyala
                </p>
                <p
                  style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}
                >
                  {lastCompleted.title} · {formatShortDate(lastCompleted.date)}
                </p>
              </div>
            </button>
          </div>
        </>
      )}

      <div style={{ height: 20 }} />
    </Screen>
  );
}

// ── Bugünün antrenman kartı ──────────────────────────
function TodayWorkoutCard({
  workout,
  onComplete,
}: {
  workout: Workout;
  onComplete: (w: Workout) => void;
}) {
  const exerciseCount = workout.workout_exercises?.length ?? 0;

  return (
    <div
      style={{
        margin: "0 16px 10px",
        background: "linear-gradient(135deg, var(--surface2), var(--surface))",
        border: `0.5px solid ${workout.completed ? "rgba(6,214,160,0.3)" : "rgba(139,127,255,0.3)"}`,
        borderRadius: 14,
        padding: 16,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dekoratif arka plan */}
      <div
        style={{
          position: "absolute",
          top: -24,
          right: -24,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${workout.completed ? "rgba(6,214,160,0.12)" : "rgba(139,127,255,0.12)"}, transparent 70%)`,
        }}
      />

      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: workout.completed ? "var(--mint)" : "var(--accent2)",
          marginBottom: 4,
        }}
      >
        {workout.completed ? "✓ Tamamlandı" : "Bugünün Antrenmanı"}
      </div>

      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
        {workout.title}
      </div>

      <div style={{ fontSize: 12, color: "var(--text2)" }}>
        {workoutTypeLabel(workout.type)}
        {exerciseCount > 0 && ` · ${exerciseCount} egzersiz`}
        {workout.duration_minutes && ` · ${workout.duration_minutes} dk`}
      </div>

      {/* Egzersiz özeti */}
      {workout.workout_exercises && workout.workout_exercises.length > 0 && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 10px",
            background: "rgba(0,0,0,0.2)",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {workout.workout_exercises.slice(0, 3).map((we) => (
            <div
              key={we.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 12, color: "var(--text2)" }}>
                {we.exercise?.name}
              </span>
              {(we.sets || we.reps) && (
                <span style={{ fontSize: 11, color: "var(--text3)" }}>
                  {we.sets && `${we.sets}×`}
                  {we.reps && `${we.reps}`}
                </span>
              )}
            </div>
          ))}
          {workout.workout_exercises.length > 3 && (
            <p style={{ fontSize: 11, color: "var(--text3)" }}>
              +{workout.workout_exercises.length - 3} egzersiz daha
            </p>
          )}
        </div>
      )}

      {/* Tamamla butonu */}
      {!workout.completed && (
        <button
          onClick={() => onComplete(workout)}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "11px",
            background: "var(--accent)",
            border: "none",
            borderRadius: 10,
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <CheckCircle size={16} /> Tamamla
        </button>
      )}
    </div>
  );
}
