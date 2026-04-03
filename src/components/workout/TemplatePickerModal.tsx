import { useState } from "react";
import { X, Trash2, ChevronRight } from "lucide-react";
import { Template, WorkoutType } from "../../types";
import { workoutTypeLabel, WORKOUT_TYPE_COLORS } from "../../lib/utils";
import { useApp } from "../../lib/AppContext";
import { supabase } from "../../lib/supabase";

interface TemplatePickerModalProps {
  onSelect: (template: Template) => void;
  onClose: () => void;
}

export function TemplatePickerModal({
  onSelect,
  onClose,
}: TemplatePickerModalProps) {
  const { templates, exercises, refetchAll, showToast } = useApp();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (!error) {
      await refetchAll();
      showToast("Şablon silindi");
    }
    setDeleting(null);
  }

  function getExerciseNames(template: Template): string {
    if (!template.exercises || template.exercises.length === 0)
      return "Egzersiz eklenmedi";
    return (
      template.exercises
        .slice(0, 3)
        .map((te) => {
          const ex = exercises.find((e) => e.id === te.exercise_id);
          return ex?.name ?? "?";
        })
        .join(", ") +
      (template.exercises.length > 3
        ? ` +${template.exercises.length - 3}`
        : "")
    );
  }

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
        <div className="flex items-center justify-between">
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Şablon Seç</h2>
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
        <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>
          Şablondan hızlıca antrenman oluştur
        </p>
      </div>

      {/* Liste */}
      <div
        className="flex-1 overflow-y-auto hide-scrollbar"
        style={{ padding: "8px 16px 32px" }}
      >
        {templates.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 0",
              color: "var(--text3)",
            }}
          >
            <p style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>📋</p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text2)",
                marginBottom: 6,
              }}
            >
              Henüz şablon yok
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>
              Antrenman oluştururken "Şablon olarak kaydet" seçeneğini kullan
            </p>
          </div>
        ) : (
          templates.map((template) => {
            const color =
              WORKOUT_TYPE_COLORS[template.type as WorkoutType] ??
              "var(--accent)";
            return (
              <div
                key={template.id}
                style={{
                  background: "var(--surface)",
                  border: "0.5px solid var(--border)",
                  borderRadius: 14,
                  marginBottom: 10,
                  overflow: "hidden",
                }}
              >
                {/* Şablon içeriği */}
                <button
                  onClick={() => onSelect(template)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: color + "22",
                      border: `0.5px solid ${color}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 18,
                    }}
                  >
                    📋
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--text)",
                        marginBottom: 2,
                      }}
                    >
                      {template.name}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color,
                        fontWeight: 500,
                        marginBottom: 2,
                      }}
                    >
                      {workoutTypeLabel(template.type as WorkoutType)}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text3)" }}>
                      {getExerciseNames(template)}
                    </p>
                  </div>
                  <ChevronRight size={16} color="var(--text3)" />
                </button>

                {/* Sil butonu */}
                <div
                  style={{
                    borderTop: "0.5px solid var(--border)",
                    padding: "8px 16px",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => handleDelete(template.id)}
                    disabled={deleting === template.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 12px",
                      background: "rgba(255,107,157,0.08)",
                      border: "0.5px solid rgba(255,107,157,0.2)",
                      borderRadius: 8,
                      color: "var(--coral)",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      opacity: deleting === template.id ? 0.5 : 1,
                    }}
                  >
                    <Trash2 size={12} />
                    {deleting === template.id ? "Siliniyor..." : "Sil"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
