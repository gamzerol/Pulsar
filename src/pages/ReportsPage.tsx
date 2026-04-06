import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useApp } from "../lib/AppContext";
import { Exercise } from "../types";
import { Screen, Header } from "../components/layout/Screen";
import { SectionTitle, StatCard } from "../components/ui";
import {
  formatShortDate,
  getMonthName,
  categoryLabel,
  WORKOUT_TYPE_COLORS,
  CATEGORY_COLORS,
} from "../lib/utils";

type RangeType = "weekly" | "monthly";

export function ReportsPage() {
  const { workouts, exercises, bodyWeights } = useApp();
  const [range, setRange] = useState<RangeType>("monthly");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  const now = new Date();

  // ── Özet istatistikler ──────────────────────────────
  const totalCompleted = workouts.filter((w) => w.completed).length;

  const thisMonthCount = workouts.filter((w) => {
    const d = new Date(w.date);
    return (
      w.completed &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  const thisWeekCount = workouts.filter((w) => {
    const d = new Date(w.date);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    return w.completed && d >= startOfWeek;
  }).length;

  const avgPerMonth = useMemo(() => {
    if (!workouts.length) return 0;
    const months = new Set(
      workouts
        .filter((w) => w.completed)
        .map((w) => {
          const d = new Date(w.date);
          return `${d.getFullYear()}-${d.getMonth()}`;
        }),
    );
    return months.size > 0 ? Math.round(totalCompleted / months.size) : 0;
  }, [workouts, totalCompleted]);

  // ── Aylık antrenman verisi ──────────────────────────
  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();
    workouts
      .filter((w) => w.completed)
      .forEach((w) => {
        const d = new Date(w.date);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        map.set(key, (map.get(key) ?? 0) + 1);
      });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, count]) => {
        const [, month] = key.split("-").map(Number);
        return { label: getMonthName(month).slice(0, 3), count };
      });
  }, [workouts]);

  // ── Haftalık antrenman verisi ───────────────────────
  const weeklyData = useMemo(() => {
    const map = new Map<string, number>();
    workouts
      .filter((w) => w.completed)
      .forEach((w) => {
        const key = `${w.year}-${w.week_number}`;
        map.set(key, (map.get(key) ?? 0) + 1);
      });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([key, count]) => {
        const [, week] = key.split("-");
        return { label: `H${week}`, count };
      });
  }, [workouts]);

  // ── En çok yapılan egzersizler ──────────────────────
  const topExercises = useMemo(() => {
    const map = new Map<string, number>();
    workouts
      .filter((w) => w.completed)
      .forEach((w) => {
        w.workout_exercises?.forEach((we) => {
          map.set(we.exercise_id, (map.get(we.exercise_id) ?? 0) + 1);
        });
      });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => {
        const ex = exercises.find((e) => e.id === id);
        return {
          id,
          name: ex?.name ?? "?",
          category: ex?.category ?? "other",
          count,
        };
      });
  }, [workouts, exercises]);

  // ── PR geçmişi (seçili egzersiz) ───────────────────
  const prHistory = useMemo(() => {
    if (!selectedExercise) return [];
    const sessions: { date: string; reps: number }[] = [];
    workouts
      .filter((w) => w.completed)
      .forEach((w) => {
        w.workout_exercises?.forEach((we) => {
          if (we.exercise_id === selectedExercise.id && we.reps !== null) {
            sessions.push({ date: w.date, reps: we.reps });
          }
        });
      });
    return sessions
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10)
      .map((s) => ({ label: formatShortDate(s.date), reps: s.reps }));
  }, [selectedExercise, workouts]);

  // ── Vücut ağırlığı verisi ───────────────────────────
  const weightData = useMemo(() => {
    return [...bodyWeights]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-12)
      .map((bw) => ({
        label: formatShortDate(bw.date),
        kg: bw.weight_kg,
      }));
  }, [bodyWeights]);

  const chartData = range === "monthly" ? monthlyData : weeklyData;

  // ── Egzersizi olan antrenmanlar (PR seçici için) ────
  const exercisesWithData = useMemo(() => {
    const ids = new Set<string>();
    workouts
      .filter((w) => w.completed)
      .forEach((w) => {
        w.workout_exercises?.forEach((we) => {
          if (we.reps !== null) ids.add(we.exercise_id);
        });
      });
    return exercises.filter((e) => ids.has(e.id));
  }, [workouts, exercises]);

  return (
    <Screen>
      <Header title="Raporlar" />

      {/* Özet kartlar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          padding: "0 16px",
          marginBottom: 10,
        }}
      >
        <StatCard value={totalCompleted} label="Toplam antrenman" />
        <StatCard value={thisMonthCount} label="Bu ay" />
        <StatCard value={thisWeekCount} label="Bu hafta" />
        <StatCard value={avgPerMonth} label="Aylık ortalama" />
      </div>

      {/* Antrenman grafiği */}
      <SectionTitle>Antrenman Sıklığı</SectionTitle>

      {/* Range seçici */}
      <div
        className="flex gap-2"
        style={{ padding: "0 16px", marginBottom: 12 }}
      >
        {(["monthly", "weekly"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{
              padding: "6px 16px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              border: `0.5px solid ${range === r ? "var(--accent)" : "var(--border2)"}`,
              background:
                range === r ? "rgba(139,127,255,0.15)" : "transparent",
              color: range === r ? "var(--accent2)" : "var(--text2)",
            }}
          >
            {r === "monthly" ? "Aylık" : "Haftalık"}
          </button>
        ))}
      </div>

      <div
        style={{
          margin: "0 16px 10px",
          background: "var(--surface)",
          border: "0.5px solid var(--border)",
          borderRadius: 14,
          padding: "16px 8px 8px",
        }}
      >
        {chartData.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              color: "var(--text3)",
              fontSize: 13,
            }}
          >
            Henüz veri yok
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={20}>
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--text3)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "rgba(139,127,255,0.08)" }}
                contentStyle={{
                  background: "var(--surface2)",
                  border: "0.5px solid var(--border2)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--text)",
                }}
                formatter={(v) => [v, "Antrenman"]}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={`rgba(139,127,255,${0.4 + (i / chartData.length) * 0.6})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* En çok yapılan egzersizler */}
      <SectionTitle>En Çok Yapılan</SectionTitle>
      <div style={{ margin: "0 16px 10px" }}>
        {topExercises.length === 0 ? (
          <div
            style={{
              background: "var(--surface)",
              border: "0.5px solid var(--border)",
              borderRadius: 14,
              padding: "24px 16px",
              textAlign: "center",
              color: "var(--text3)",
              fontSize: 13,
            }}
          >
            Henüz tamamlanmış antrenman yok
          </div>
        ) : (
          <div
            style={{
              background: "var(--surface)",
              border: "0.5px solid var(--border)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {topExercises.map((ex, i) => {
              const color =
                CATEGORY_COLORS[ex.category as keyof typeof CATEGORY_COLORS] ??
                "var(--accent)";
              const maxCount = topExercises[0].count;
              const pct = (ex.count / maxCount) * 100;
              return (
                <div
                  key={ex.id}
                  style={{
                    padding: "12px 16px",
                    borderBottom:
                      i < topExercises.length - 1
                        ? "0.5px solid var(--border)"
                        : "none",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text3)",
                          fontWeight: 600,
                          minWidth: 16,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text)",
                        }}
                      >
                        {ex.name}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color, fontWeight: 600 }}>
                      {ex.count}×
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "var(--surface2)",
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: color,
                        borderRadius: 99,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PR Grafiği */}
      <SectionTitle>Egzersiz PR Grafiği</SectionTitle>
      <div style={{ padding: "0 16px", marginBottom: 10 }}>
        <select
          value={selectedExercise?.id ?? ""}
          onChange={(e) => {
            const ex = exercises.find((x) => x.id === e.target.value) ?? null;
            setSelectedExercise(ex);
          }}
          style={{
            width: "100%",
            padding: "11px 14px",
            borderRadius: 10,
            fontSize: 14,
            background: "var(--surface)",
            border: "0.5px solid var(--border2)",
            color: selectedExercise ? "var(--text)" : "var(--text3)",
            outline: "none",
            appearance: "none",
            marginBottom: 10,
          }}
        >
          <option value="">Egzersiz seç...</option>
          {exercisesWithData.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name} ({categoryLabel(ex.category)})
            </option>
          ))}
        </select>

        <div
          style={{
            background: "var(--surface)",
            border: "0.5px solid var(--border)",
            borderRadius: 14,
            padding: "16px 8px 8px",
          }}
        >
          {!selectedExercise || prHistory.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "var(--text3)",
                fontSize: 13,
              }}
            >
              {!selectedExercise
                ? "Egzersiz seç"
                : "Bu egzersiz için rep verisi yok"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={prHistory}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--text3)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface2)",
                    border: "0.5px solid var(--border2)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--text)",
                  }}
                  formatter={(v) => [v, "Rep"]}
                />
                <Line
                  type="monotone"
                  dataKey="reps"
                  stroke="var(--accent2)"
                  strokeWidth={2}
                  dot={{ fill: "var(--accent)", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "var(--accent2)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Vücut ağırlığı grafiği */}
      <SectionTitle>Vücut Ağırlığı</SectionTitle>
      <div
        style={{
          margin: "0 16px",
          background: "var(--surface)",
          border: "0.5px solid var(--border)",
          borderRadius: 14,
          padding: "16px 8px 8px",
        }}
      >
        {weightData.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              color: "var(--text3)",
              fontSize: 13,
            }}
          >
            Henüz ağırlık kaydı yok —{" "}
            <span style={{ color: "var(--accent2)" }}>Profil</span>'den
            ekleyebilirsin
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weightData}>
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--text3)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "var(--surface2)",
                  border: "0.5px solid var(--border2)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--text)",
                }}
                formatter={(v) => [`${v} kg`, "Ağırlık"]}
              />
              <Line
                type="monotone"
                dataKey="kg"
                stroke="var(--mint)"
                strokeWidth={2}
                dot={{ fill: "var(--mint)", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ height: 20 }} />
    </Screen>
  );
}
