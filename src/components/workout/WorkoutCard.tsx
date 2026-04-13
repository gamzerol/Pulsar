import { Workout } from "../../types";
import {
  formatShortDate,
  workoutTypeLabel,
  WORKOUT_TYPE_COLORS,
} from "../../lib/utils";
import { CheckCircle, Circle, Copy, Pencil, Trash2 } from "lucide-react";

interface WorkoutCardProps {
  workout: Workout;
  onComplete?: (workout: Workout) => void;
  onEdit?: (workout: Workout) => void;
  onCopy?: (workout: Workout) => void;
  onDelete?: (workout: Workout) => void;
}

export function WorkoutCard({
  workout,
  onComplete,
  onEdit,
  onCopy,
  onDelete,
}: WorkoutCardProps) {
  const color = WORKOUT_TYPE_COLORS[workout.type];
  const exerciseCount = workout.workout_exercises?.length ?? 0;

  return (
    <div
      data-testid="workout-card"
      data-workout-id={workout.id}
      style={{
        background: "var(--surface)",
        border: `0.5px solid ${workout.completed ? "rgba(6,214,160,0.25)" : "var(--border)"}`,
        borderRadius: 14,
        padding: "14px 16px",
        margin: "0 16px 10px",
      }}
    >
      {/* Üst satır */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: color,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span
              style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500 }}
            >
              {formatShortDate(workout.date)}
            </span>
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 99,
                background: color + "22",
                color,
                fontWeight: 600,
              }}
            >
              {workoutTypeLabel(workout.type)}
            </span>
          </div>

          <p
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: workout.completed ? "var(--text2)" : "var(--text)",
              textDecoration: workout.completed ? "line-through" : "none",
              marginBottom: 2,
            }}
          >
            {workout.title}
          </p>

          <p style={{ fontSize: 12, color: "var(--text3)" }}>
            {exerciseCount > 0
              ? `${exerciseCount} egzersiz`
              : "Egzersiz eklenmedi"}
            {workout.duration_minutes
              ? ` · ${workout.duration_minutes} dk`
              : ""}
          </p>
        </div>

        {/* Tamamla butonu */}
        <button
          onClick={() => onComplete?.(workout)}
          style={{
            background: "none",
            border: "none",
            cursor: workout.completed ? "default" : "pointer",
            color: workout.completed ? "var(--mint)" : "var(--text3)",
            padding: 4,
            flexShrink: 0,
          }}
        >
          {workout.completed ? <CheckCircle size={22} /> : <Circle size={22} />}
        </button>
      </div>

      {/* Egzersiz listesi */}
      {workout.workout_exercises && workout.workout_exercises.length > 0 && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 10px",
            background: "var(--surface2)",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {workout.workout_exercises.slice(0, 3).map((we) => (
            <div key={we.id} className="flex items-center justify-between">
              <span style={{ fontSize: 12, color: "var(--text2)" }}>
                {we.exercise?.name ?? "Egzersiz"}
              </span>
              {(we.sets || we.reps) && (
                <span style={{ fontSize: 11, color: "var(--text3)" }}>
                  {we.sets && `${we.sets} set`}
                  {we.sets && we.reps && " × "}
                  {we.reps && `${we.reps} rep`}
                </span>
              )}
            </div>
          ))}
          {workout.workout_exercises.length > 3 && (
            <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
              +{workout.workout_exercises.length - 3} daha...
            </p>
          )}
        </div>
      )}

      {/* Alt aksiyon butonları */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => onEdit?.(workout)}
          data-testid="workout-edit-btn"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "8px",
            background: "var(--surface2)",
            border: "0.5px solid var(--border2)",
            borderRadius: 8,
            color: "var(--text2)",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <Pencil size={13} /> Düzenle
        </button>
        <button
          data-testid="workout-copy-btn"
          onClick={() => onCopy?.(workout)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "8px",
            background: "var(--surface2)",
            border: "0.5px solid var(--border2)",
            borderRadius: 8,
            color: "var(--text2)",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <Copy size={13} /> Kopyala
        </button>
        <button
          data-testid="workout-delete-btn"
          onClick={() => onDelete?.(workout)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 10px",
            background: "rgba(255,107,157,0.08)",
            border: "0.5px solid rgba(255,107,157,0.2)",
            borderRadius: 8,
            color: "var(--coral)",
            cursor: "pointer",
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
