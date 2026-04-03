import { useState } from "react";
import { Search, X, Plus } from "lucide-react";
import { Exercise, ExerciseCategory } from "../../types";
import { categoryLabel, CATEGORY_COLORS } from "../../lib/utils";
import { useApp } from "../../lib/AppContext";

const CATEGORIES: ExerciseCategory[] = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "cardio",
];

interface ExercisePickerModalProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
  selectedIds?: string[];
}

export function ExercisePickerModal({
  onSelect,
  onClose,
  selectedIds = [],
}: ExercisePickerModalProps) {
  const { exercises } = useApp();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    ExerciseCategory | "all"
  >("all");

  const filtered = exercises.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "all" || ex.category === activeCategory;
    return matchSearch && matchCategory;
  });

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
          padding: "52px 20px 12px",
          background: "linear-gradient(to bottom, var(--bg) 65%, transparent)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Egzersiz Seç</h2>
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

        {/* Arama */}
        <div style={{ position: "relative", marginBottom: 12 }}>
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
            autoFocus
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

        {/* Kategori filtreleri */}
        <div
          className="flex gap-2 hide-scrollbar"
          style={{ overflowX: "auto", paddingBottom: 4 }}
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
              color:
                activeCategory === "all" ? "var(--accent2)" : "var(--text2)",
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
      </div>

      {/* Liste */}
      <div
        className="flex-1 overflow-y-auto hide-scrollbar"
        style={{ padding: "8px 16px 32px" }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 0",
              color: "var(--text3)",
            }}
          >
            <p style={{ fontSize: 14 }}>Egzersiz bulunamadı</p>
          </div>
        ) : (
          filtered.map((ex) => {
            const alreadyAdded = selectedIds.includes(ex.id);
            const color = CATEGORY_COLORS[ex.category];
            return (
              <button
                key={ex.id}
                onClick={() => !alreadyAdded && onSelect(ex)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  marginBottom: 6,
                  background: alreadyAdded
                    ? "rgba(139,127,255,0.06)"
                    : "var(--surface)",
                  border: `0.5px solid ${alreadyAdded ? "rgba(139,127,255,0.2)" : "var(--border)"}`,
                  borderRadius: 12,
                  cursor: alreadyAdded ? "default" : "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: color + "22",
                    border: `0.5px solid ${color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 16,
                  }}
                >
                  {categoryEmoji(ex.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: alreadyAdded ? "var(--text2)" : "var(--text)",
                    }}
                  >
                    {ex.name}
                  </p>
                  <p style={{ fontSize: 11, color }}>
                    {categoryLabel(ex.category)}
                  </p>
                </div>
                {alreadyAdded ? (
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--accent2)",
                      fontWeight: 500,
                    }}
                  >
                    Eklendi
                  </span>
                ) : (
                  <Plus size={18} color="var(--text3)" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function categoryEmoji(cat: ExerciseCategory): string {
  const map: Record<ExerciseCategory, string> = {
    chest: "💪",
    back: "🏋️",
    legs: "🦵",
    shoulders: "🔝",
    arms: "💪",
    core: "🔥",
    cardio: "🏃",
  };
  return map[cat];
}
