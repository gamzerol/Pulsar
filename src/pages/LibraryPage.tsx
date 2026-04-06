import { useState } from "react";
import { Search, Trophy } from "lucide-react";
import { useApp } from "../lib/AppContext";
import { Exercise, ExerciseCategory } from "../types";
import { categoryLabel, CATEGORY_COLORS } from "../lib/utils";
import { Screen, Header } from "../components/layout/Screen";
import { ExerciseDetailModal } from "../components/workout/ExerciseDetailModal";

const CATEGORIES: ExerciseCategory[] = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "cardio",
];

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

export function LibraryPage() {
  const { exercises, workouts } = useApp();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    ExerciseCategory | "all"
  >("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  const filtered = exercises.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "all" || ex.category === activeCategory;
    return matchSearch && matchCategory;
  });

  // Hangi egzersizlerin en az 1 kaydı var
  function hasRecord(exerciseId: string): boolean {
    return workouts.some(
      (w) =>
        w.completed &&
        w.workout_exercises?.some((we) => we.exercise_id === exerciseId),
    );
  }

  // Gruba göre egzersizleri listele
  const grouped = CATEGORIES.reduce(
    (acc, cat) => {
      const list = filtered.filter((ex) => ex.category === cat);
      if (list.length > 0) acc[cat] = list;
      return acc;
    },
    {} as Record<string, Exercise[]>,
  );

  if (selectedExercise) {
    return (
      <ExerciseDetailModal
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    );
  }

  return (
    <Screen>
      <Header title="Kütüphane" subtitle={`${exercises.length} egzersiz`} />

      {/* Arama */}
      <div style={{ padding: "0 16px", marginBottom: 12 }}>
        <div style={{ position: "relative" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text3)",
            }}
          />
          <input
            type="text"
            placeholder="Egzersiz ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
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

      {/* Kategori filtreleri */}
      <div
        className="flex gap-2 hide-scrollbar"
        style={{ overflowX: "auto", padding: "0 16px 4px", marginBottom: 16 }}
      >
        <button
          onClick={() => setActiveCategory("all")}
          style={{
            padding: "5px 14px",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 500,
            whiteSpace: "nowrap",
            cursor: "pointer",
            border: `0.5px solid ${activeCategory === "all" ? "var(--accent)" : "var(--border2)"}`,
            background:
              activeCategory === "all"
                ? "rgba(139,127,255,0.15)"
                : "transparent",
            color: activeCategory === "all" ? "var(--accent2)" : "var(--text2)",
          }}
        >
          Tümü
        </button>
        {CATEGORIES.map((cat) => {
          const color = CATEGORY_COLORS[cat];
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "5px 14px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 500,
                whiteSpace: "nowrap",
                cursor: "pointer",
                border: `0.5px solid ${active ? color : "var(--border2)"}`,
                background: active ? color + "22" : "transparent",
                color: active ? color : "var(--text2)",
              }}
            >
              {categoryLabel(cat)}
            </button>
          );
        })}
      </div>

      {/* Liste */}
      {activeCategory === "all" && search === "" ? (
        // Kategoriye göre gruplu görünüm
        Object.entries(grouped).map(([cat, list]) => {
          const color = CATEGORY_COLORS[cat as ExerciseCategory];
          return (
            <div key={cat}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0 20px",
                  margin: "16px 0 8px",
                }}
              >
                <span style={{ fontSize: 14 }}>{categoryEmoji(cat)}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color,
                  }}
                >
                  {categoryLabel(cat as ExerciseCategory)}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text3)",
                    marginLeft: 4,
                  }}
                >
                  {list.length}
                </span>
              </div>
              {list.map((ex) => (
                <ExerciseItem
                  key={ex.id}
                  exercise={ex}
                  hasRecord={hasRecord(ex.id)}
                  onClick={() => setSelectedExercise(ex)}
                />
              ))}
            </div>
          );
        })
      ) : (
        // Düz liste (arama veya filtre aktif)
        <div style={{ padding: "0 0 16px" }}>
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: "var(--text3)",
              }}
            >
              <p style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>🔍</p>
              <p style={{ fontSize: 14, color: "var(--text2)" }}>
                Egzersiz bulunamadı
              </p>
            </div>
          ) : (
            filtered.map((ex) => (
              <ExerciseItem
                key={ex.id}
                exercise={ex}
                hasRecord={hasRecord(ex.id)}
                onClick={() => setSelectedExercise(ex)}
              />
            ))
          )}
        </div>
      )}

      <div style={{ height: 20 }} />
    </Screen>
  );
}

// ── Egzersiz satırı ──────────────────────────────────
function ExerciseItem({
  exercise,
  hasRecord,
  onClick,
}: {
  exercise: Exercise;
  hasRecord: boolean;
  onClick: () => void;
}) {
  const color = CATEGORY_COLORS[exercise.category];

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 16px",
        background: "transparent",
        border: "none",
        borderBottom: "0.5px solid var(--border)",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: color + "18",
          border: `0.5px solid ${color}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {categoryEmoji(exercise.category)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
          {exercise.name}
        </p>
        <p style={{ fontSize: 11, color, marginTop: 1 }}>
          {categoryLabel(exercise.category)}
        </p>
      </div>

      {hasRecord && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            color: "var(--gold)",
            fontWeight: 500,
          }}
        >
          <Trophy size={12} />
          PR
        </div>
      )}
    </button>
  );
}
