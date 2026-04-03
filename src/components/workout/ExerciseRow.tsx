import { Trash2, GripVertical } from "lucide-react";
import { Exercise } from "../../types";
import { categoryLabel } from "../../lib/utils";

export interface ExerciseRowData {
  tempId: string;
  exercise: Exercise;
  sets: number | null;
  reps: number | null;
  duration_seconds: number | null;
  notes: string | null;
}

interface ExerciseRowProps {
  data: ExerciseRowData;
  index: number;
  onChange: (tempId: string, field: keyof ExerciseRowData, value: any) => void;
  onRemove: (tempId: string) => void;
}

export function ExerciseRow({
  data,
  index,
  onChange,
  onRemove,
}: ExerciseRowProps) {
  const isCardio = data.exercise.category === "cardio";

  return (
    <div
      style={{
        background: "var(--surface2)",
        border: "0.5px solid var(--border2)",
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
      }}
    >
      {/* Başlık satırı */}
      <div className="flex items-center gap-2 mb-3">
        <GripVertical size={14} color="var(--text3)" />
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            {index + 1}. {data.exercise.name}
          </p>
          <p style={{ fontSize: 11, color: "var(--text3)" }}>
            {categoryLabel(data.exercise.category)}
          </p>
        </div>
        <button
          onClick={() => onRemove(data.tempId)}
          style={{
            background: "none",
            border: "none",
            color: "var(--coral)",
            cursor: "pointer",
            padding: 4,
          }}
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Set / Rep / Süre */}
      <div className="flex gap-2">
        {!isCardio && (
          <>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: 11,
                  color: "var(--text3)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Set
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={data.sets ?? ""}
                placeholder="—"
                onChange={(e) =>
                  onChange(
                    data.tempId,
                    "sets",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: "center",
                  background: "var(--surface)",
                  border: "0.5px solid var(--border2)",
                  color: "var(--text)",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: 11,
                  color: "var(--text3)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Rep
              </label>
              <input
                type="number"
                min={1}
                max={999}
                value={data.reps ?? ""}
                placeholder="—"
                onChange={(e) =>
                  onChange(
                    data.tempId,
                    "reps",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: "center",
                  background: "var(--surface)",
                  border: "0.5px solid var(--border2)",
                  color: "var(--text)",
                  outline: "none",
                }}
              />
            </div>
          </>
        )}

        {isCardio && (
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: 11,
                color: "var(--text3)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Süre (dakika)
            </label>
            <input
              type="number"
              min={1}
              value={data.duration_seconds ? data.duration_seconds / 60 : ""}
              placeholder="—"
              onChange={(e) =>
                onChange(
                  data.tempId,
                  "duration_seconds",
                  e.target.value ? Number(e.target.value) * 60 : null,
                )
              }
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textAlign: "center",
                background: "var(--surface)",
                border: "0.5px solid var(--border2)",
                color: "var(--text)",
                outline: "none",
              }}
            />
          </div>
        )}
      </div>

      {/* Not alanı */}
      <div style={{ marginTop: 8 }}>
        <input
          type="text"
          value={data.notes ?? ""}
          placeholder="Not ekle (opsiyonel)"
          onChange={(e) =>
            onChange(data.tempId, "notes", e.target.value || null)
          }
          style={{
            width: "100%",
            padding: "7px 10px",
            borderRadius: 8,
            fontSize: 12,
            background: "var(--surface)",
            border: "0.5px solid var(--border)",
            color: "var(--text2)",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}
