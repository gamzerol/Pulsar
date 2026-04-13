import { useState } from "react";
import { Plus, ChevronLeft, BookmarkPlus } from "lucide-react";
import { useApp } from "../lib/AppContext";
import { supabase } from "../lib/supabase";
import { Workout, WorkoutType, Template, Exercise } from "../types";
import { today, getWeekNumber } from "../lib/utils";
import {
  ExerciseRow,
  ExerciseRowData,
} from "../components/workout/ExerciseRow";
import { ExercisePickerModal } from "../components/workout/ExercisePickerModal";
import { TemplatePickerModal } from "../components/workout/TemplatePickerModal";

interface WorkoutFormPageProps {
  editingWorkout?: Workout | null;
  onClose: () => void;
}

const WORKOUT_TYPES: { value: WorkoutType; label: string }[] = [
  { value: "strength", label: "Güç" },
  { value: "cardio", label: "Kardiyo" },
  { value: "flexibility", label: "Esneklik" },
  { value: "other", label: "Diğer" },
];

function generateTempId() {
  return Math.random().toString(36).slice(2);
}

export function WorkoutFormPage({
  editingWorkout,
  onClose,
}: WorkoutFormPageProps) {
  const { refetchAll, showToast, exercises } = useApp();

  const [title, setTitle] = useState(editingWorkout?.title ?? "");
  const [type, setType] = useState<WorkoutType>(
    editingWorkout?.type ?? "strength",
  );
  const [date, setDate] = useState(editingWorkout?.date ?? today());
  const [duration, setDuration] = useState(
    editingWorkout?.duration_minutes?.toString() ?? "",
  );
  const [notes, setNotes] = useState(editingWorkout?.notes ?? "");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const [rows, setRows] = useState<ExerciseRowData[]>(() => {
    if (!editingWorkout?.workout_exercises) return [];
    return editingWorkout.workout_exercises.map((we) => ({
      tempId: generateTempId(),
      exercise: we.exercise!,
      sets: we.sets,
      reps: we.reps,
      duration_seconds: we.duration_seconds,
      notes: we.notes,
    }));
  });

  function handleAddExercise(exercise: Exercise) {
    setRows((prev) => [
      ...prev,
      {
        tempId: generateTempId(),
        exercise,
        sets: null,
        reps: null,
        duration_seconds: null,
        notes: null,
      },
    ]);
    setShowExercisePicker(false);
  }

  function handleRowChange(
    tempId: string,
    field: keyof ExerciseRowData,
    value: any,
  ) {
    setRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r)),
    );
  }

  function handleRemoveRow(tempId: string) {
    setRows((prev) => prev.filter((r) => r.tempId !== tempId));
  }

  function handleSelectTemplate(template: Template) {
    setTitle(template.name);
    setType(template.type as WorkoutType);
    const templateRows: ExerciseRowData[] = template.exercises
      .map((te) => {
        const exercise = exercises.find((e) => e.id === te.exercise_id);
        if (!exercise) return null;
        return {
          tempId: generateTempId(),
          exercise,
          sets: te.sets,
          reps: te.reps,
          duration_seconds: te.duration_seconds,
          notes: null,
        };
      })
      .filter(Boolean) as ExerciseRowData[];
    setRows(templateRows);
    setShowTemplatePicker(false);
  }

  async function handleSave() {
    if (!title.trim()) {
      showToast("Antrenman adı gir");
      return;
    }

    setSaving(true);
    try {
      const workoutData = {
        title: title.trim(),
        type,
        date,
        week_number: getWeekNumber(date),
        year: new Date(date).getFullYear(),
        duration_minutes: duration ? Number(duration) : null,
        notes: notes.trim() || null,
        completed: editingWorkout?.completed ?? false,
      };
      console.log(workoutData);

      let workoutId: string;

      if (editingWorkout) {
        // Güncelle
        const { error } = await supabase
          .from("workouts")
          .update(workoutData)
          .eq("id", editingWorkout.id);
        if (error) throw error;
        workoutId = editingWorkout.id;

        // Eski egzersizleri sil
        await supabase
          .from("workout_exercises")
          .delete()
          .eq("workout_id", workoutId);
      } else {
        // Yeni oluştur
        const { data, error } = await supabase
          .from("workouts")
          .insert(workoutData)
          .select()
          .single();
        if (error) throw error;
        workoutId = data.id;
      }

      // Egzersizleri kaydet
      if (rows.length > 0) {
        const exerciseInserts = rows.map((r, i) => ({
          workout_id: workoutId,
          exercise_id: r.exercise.id,
          sets: r.sets,
          reps: r.reps,
          duration_seconds: r.duration_seconds,
          notes: r.notes,
          order_index: i,
        }));
        const { error } = await supabase
          .from("workout_exercises")
          .insert(exerciseInserts);
        if (error) throw error;
      }

      // Şablon olarak kaydet
      if (saveAsTemplate && !editingWorkout) {
        const templateExercises = rows.map((r) => ({
          exercise_id: r.exercise.id,
          sets: r.sets,
          reps: r.reps,
          duration_seconds: r.duration_seconds,
        }));
        await supabase.from("templates").insert({
          name: title.trim(),
          type,
          exercises: templateExercises,
        });
      }

      await refetchAll();
      showToast(
        editingWorkout
          ? "✅ Antrenman güncellendi"
          : "🚀 Antrenman oluşturuldu!",
      );
      onClose();
    } catch (err) {
      showToast("Bir hata oluştu");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (showExercisePicker) {
    return (
      <ExercisePickerModal
        onSelect={handleAddExercise}
        onClose={() => setShowExercisePicker(false)}
        selectedIds={rows.map((r) => r.exercise.id)}
      />
    );
  }

  if (showTemplatePicker) {
    return (
      <TemplatePickerModal
        onSelect={handleSelectTemplate}
        onClose={() => setShowTemplatePicker(false)}
      />
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto hide-scrollbar relative z-10 animate-slide-up"
      style={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <div
        style={{
          padding: "52px 20px 16px",
          background: "linear-gradient(to bottom, var(--bg) 65%, transparent)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              fontWeight: 500,
              padding: 0,
            }}
          >
            <ChevronLeft size={18} />
            Geri
          </button>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>
            {editingWorkout ? "Antrenmanı Düzenle" : "Yeni Antrenman"}
          </h2>
          <div style={{ width: 60 }} />
        </div>
      </div>

      <div
        style={{
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Şablondan yükle */}
        {!editingWorkout && (
          <button
            onClick={() => setShowTemplatePicker(true)}
            style={{
              width: "100%",
              padding: "11px 16px",
              background: "rgba(139,127,255,0.08)",
              border: "0.5px solid rgba(139,127,255,0.25)",
              borderRadius: 12,
              color: "var(--accent2)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            📋 Şablondan Yükle
          </button>
        )}

        {/* Başlık */}
        <div>
          <label
            style={{
              fontSize: 12,
              color: "var(--text2)",
              display: "block",
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            Antrenman Adı
          </label>
          <input
            data-testid="workout-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: Göğüs & Triseps"
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 10,
              fontSize: 14,
              background: "var(--surface)",
              border: "0.5px solid var(--border2)",
              color: "var(--text)",
              outline: "none",
            }}
          />
        </div>

        {/* Tip */}
        <div>
          <label
            style={{
              fontSize: 12,
              color: "var(--text2)",
              display: "block",
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            Antrenman Tipi
          </label>
          <div className="flex gap-2 flex-wrap">
            {WORKOUT_TYPES.map((wt) => (
              <button
                key={wt.value}
                onClick={() => setType(wt.value)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 99,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: `0.5px solid ${type === wt.value ? "var(--accent)" : "var(--border2)"}`,
                  background:
                    type === wt.value
                      ? "rgba(139,127,255,0.15)"
                      : "transparent",
                  color: type === wt.value ? "var(--accent2)" : "var(--text2)",
                }}
              >
                {wt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tarih & Süre */}
        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: 12,
                color: "var(--text2)",
                display: "block",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Tarih
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                fontSize: 14,
                background: "var(--surface)",
                border: "0.5px solid var(--border2)",
                color: "var(--text)",
                outline: "none",
                colorScheme: "dark",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: 12,
                color: "var(--text2)",
                display: "block",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Süre (dk)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="—"
              min={1}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                fontSize: 14,
                background: "var(--surface)",
                border: "0.5px solid var(--border2)",
                color: "var(--text)",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Notlar */}
        <div>
          <label
            style={{
              fontSize: 12,
              color: "var(--text2)",
              display: "block",
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            Notlar (opsiyonel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Bugün nasıl hissettim, dikkat ettiğim şeyler..."
            rows={3}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 10,
              fontSize: 14,
              background: "var(--surface)",
              border: "0.5px solid var(--border2)",
              color: "var(--text)",
              outline: "none",
              resize: "none",
            }}
          />
        </div>

        {/* Egzersizler */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label
              style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500 }}
            >
              Egzersizler ({rows.length})
            </label>
            <button
              onClick={() => setShowExercisePicker(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "rgba(139,127,255,0.1)",
                border: "0.5px solid rgba(139,127,255,0.25)",
                borderRadius: 8,
                color: "var(--accent2)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Plus size={14} /> Egzersiz Ekle
            </button>
          </div>

          {rows.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px",
                background: "var(--surface)",
                border: "0.5px dashed var(--border2)",
                borderRadius: 12,
                color: "var(--text3)",
                fontSize: 13,
              }}
            >
              Henüz egzersiz eklenmedi
            </div>
          ) : (
            rows.map((row, i) => (
              <ExerciseRow
                key={row.tempId}
                data={row}
                index={i}
                onChange={handleRowChange}
                onRemove={handleRemoveRow}
              />
            ))
          )}
        </div>

        {/* Şablon olarak kaydet */}
        {!editingWorkout && (
          <button
            onClick={() => setSaveAsTemplate((prev) => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 14px",
              background: saveAsTemplate
                ? "rgba(139,127,255,0.1)"
                : "var(--surface)",
              border: `0.5px solid ${saveAsTemplate ? "rgba(139,127,255,0.35)" : "var(--border2)"}`,
              borderRadius: 12,
              cursor: "pointer",
              color: saveAsTemplate ? "var(--accent2)" : "var(--text2)",
              fontSize: 13,
              fontWeight: 500,
              width: "100%",
              textAlign: "left",
            }}
          >
            <BookmarkPlus size={16} />
            Şablon olarak da kaydet
            <span
              style={{
                marginLeft: "auto",
                width: 20,
                height: 20,
                borderRadius: 6,
                background: saveAsTemplate ? "var(--accent)" : "transparent",
                border: `1.5px solid ${saveAsTemplate ? "var(--accent)" : "var(--border2)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {saveAsTemplate && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          </button>
        )}

        {/* Kaydet butonu */}
        <button
          onClick={handleSave}
          data-testid="workout-save-btn"
          disabled={saving}
          style={{
            width: "100%",
            padding: "15px",
            background: saving ? "rgba(139,127,255,0.4)" : "var(--accent)",
            border: "none",
            borderRadius: 12,
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {saving
            ? "Kaydediliyor..."
            : editingWorkout
              ? "Güncelle"
              : "Antrenman Oluştur"}
        </button>
      </div>
    </div>
  );
}
