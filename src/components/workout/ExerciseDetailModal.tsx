import { X, Trophy } from "lucide-react";
import { Exercise, Workout } from "../../types";
import {
  categoryLabel,
  CATEGORY_COLORS,
  formatShortDate,
} from "../../lib/utils";
import { useApp } from "../../lib/AppContext";

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
}

interface PRData {
  maxReps: number | null;
  maxSets: number | null;
  totalSessions: number;
  history: { date: string; sets: number | null; reps: number | null }[];
}

function calcPR(exercise: Exercise, workouts: Workout[]): PRData {
  const sessions: { date: string; sets: number | null; reps: number | null }[] =
    [];

  workouts.forEach((w) => {
    if (!w.completed) return;
    w.workout_exercises?.forEach((we) => {
      if (we.exercise_id === exercise.id) {
        sessions.push({ date: w.date, sets: we.sets, reps: we.reps });
      }
    });
  });

  sessions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const maxReps = sessions.reduce(
    (max, s) => {
      if (s.reps === null) return max;
      return max === null ? s.reps : Math.max(max, s.reps);
    },
    null as number | null,
  );

  const maxSets = sessions.reduce(
    (max, s) => {
      if (s.sets === null) return max;
      return max === null ? s.sets : Math.max(max, s.sets);
    },
    null as number | null,
  );

  return {
    maxReps,
    maxSets,
    totalSessions: sessions.length,
    history: sessions.slice(0, 10),
  };
}

export function ExerciseDetailModal({
  exercise,
  onClose,
}: ExerciseDetailModalProps) {
  const { workouts } = useApp();
  const pr = calcPR(exercise, workouts);
  const color = CATEGORY_COLORS[exercise.category];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        maxWidth: 430,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "52px 20px 16px",
          background: "linear-gradient(to bottom, var(--bg) 65%, transparent)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: color + "22",
                border: `0.5px solid ${color}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              {categoryEmoji(exercise.category)}
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>{exercise.name}</h2>
              <p style={{ fontSize: 12, color, fontWeight: 500 }}>
                {categoryLabel(exercise.category)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--surface2)",
              border: "0.5px solid var(--border2)",
              borderRadius: 99,
              padding: "6px 14px",
              color: "var(--text2)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <X size={14} /> Kapat
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto hide-scrollbar"
        style={{ padding: "0 16px 32px" }}
      >
        {/* PR Kartları */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <PRCard
            label="En Yüksek Rep"
            value={pr.maxReps !== null ? String(pr.maxReps) : "—"}
            icon="🏆"
            color={color}
          />
          <PRCard
            label="En Yüksek Set"
            value={pr.maxSets !== null ? String(pr.maxSets) : "—"}
            icon="💪"
            color={color}
          />
          <PRCard
            label="Toplam Seans"
            value={String(pr.totalSessions)}
            icon="📅"
            color={color}
          />
        </div>

        {/* Geçmiş */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text3)",
            marginBottom: 10,
          }}
        >
          Son 10 Seans
        </p>

        {pr.history.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              color: "var(--text3)",
            }}
          >
            <p style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>📊</p>
            <p style={{ fontSize: 14, color: "var(--text2)" }}>
              Henüz kayıt yok
            </p>
            <p style={{ fontSize: 12, marginTop: 4 }}>
              Bu egzersizi bir antrenmana ekleyip tamamla
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {pr.history.map((h, i) => {
              const isMaxRep = h.reps !== null && h.reps === pr.maxReps;
              const isMaxSet = h.sets !== null && h.sets === pr.maxSets;
              return (
                <div
                  key={i}
                  style={{
                    background:
                      isMaxRep || isMaxSet ? color + "10" : "var(--surface)",
                    border: `0.5px solid ${isMaxRep || isMaxSet ? color + "30" : "var(--border)"}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div className="flex items-center gap-8">
                    <span style={{ fontSize: 12, color: "var(--text3)" }}>
                      {formatShortDate(h.date)}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {h.sets !== null && `${h.sets} set`}
                      {h.sets !== null && h.reps !== null && " × "}
                      {h.reps !== null && `${h.reps} rep`}
                      {h.sets === null && h.reps === null && "—"}
                    </span>
                  </div>
                  {(isMaxRep || isMaxSet) && <Trophy size={14} color={color} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PRCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border)",
        borderRadius: 12,
        padding: "12px 10px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "var(--text3)",
          marginTop: 4,
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function categoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    chest: "💪",
    back: "🏋️",
    legs: "🦵",
    shoulders: "🔝",
    arms: "💪",
    core: "🔥",
    cardio: "🏃",
  };
  return map[cat] ?? "💪";
}
