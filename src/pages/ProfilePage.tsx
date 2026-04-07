import { useState, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import {
  Target,
  Plus,
  Download,
  Trash2,
  Trophy,
  Calendar,
  Zap,
} from "lucide-react";
import { useApp } from "../lib/AppContext";
import { supabase } from "../lib/supabase";
import { Screen, Header } from "../components/layout/Screen";
import { SectionTitle } from "../components/ui";
import { getMonthName, calculateStreak } from "../lib/utils";

export function ProfilePage() {
  const { workouts, bodyWeights, goals, refetchAll, showToast } = useApp();

  // ── Aylık hedef ─────────────────────────────────────
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentGoal = goals.find(
    (g) => g.month === currentMonth && g.year === currentYear,
  );

  const [targetInput, setTargetInput] = useState(
    currentGoal?.target_workout_count?.toString() ?? "",
  );
  const [savingGoal, setSavingGoal] = useState(false);

  const thisMonthCount = workouts.filter((w) => {
    const d = new Date(w.date);
    return (
      w.completed &&
      d.getMonth() + 1 === currentMonth &&
      d.getFullYear() === currentYear
    );
  }).length;

  const goalProgress = currentGoal
    ? Math.min((thisMonthCount / currentGoal.target_workout_count) * 100, 100)
    : 0;

  async function handleSaveGoal() {
    if (!targetInput || Number(targetInput) < 1) {
      showToast("Geçerli bir hedef gir");
      return;
    }
    setSavingGoal(true);
    try {
      if (currentGoal) {
        await supabase
          .from("goals")
          .update({ target_workout_count: Number(targetInput) })
          .eq("id", currentGoal.id);
      } else {
        await supabase.from("goals").insert({
          month: currentMonth,
          year: currentYear,
          target_workout_count: Number(targetInput),
        });
      }
      await refetchAll();
      showToast("🎯 Hedef kaydedildi!");
    } finally {
      setSavingGoal(false);
    }
  }

  // ── Vücut ağırlığı ───────────────────────────────────
  const [weightInput, setWeightInput] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  const latestWeight = bodyWeights[0];

  async function handleSaveWeight() {
    const val = parseFloat(weightInput);
    if (isNaN(val) || val < 20 || val > 300) {
      showToast("Geçerli bir ağırlık gir");
      return;
    }
    setSavingWeight(true);
    try {
      await supabase.from("body_weight").insert({
        weight_kg: val,
        date: new Date().toISOString().split("T")[0],
      });
      await refetchAll();
      showToast("⚖️ Ağırlık kaydedildi!");
      setWeightInput("");
    } finally {
      setSavingWeight(false);
    }
  }

  async function handleDeleteWeight(id: string) {
    await supabase.from("body_weight").delete().eq("id", id);
    await refetchAll();
    showToast("Kayıt silindi");
  }

  // ── Yıl özeti ────────────────────────────────────────
  const yearSummary = useMemo(() => {
    const yearWorkouts = workouts.filter((w) => {
      return w.completed && new Date(w.date).getFullYear() === currentYear;
    });

    const monthMap = new Map<number, number>();
    yearWorkouts.forEach((w) => {
      const m = new Date(w.date).getMonth() + 1;
      monthMap.set(m, (monthMap.get(m) ?? 0) + 1);
    });

    let mostActiveMonth = 0;
    let mostActiveCount = 0;
    monthMap.forEach((count, month) => {
      if (count > mostActiveCount) {
        mostActiveCount = count;
        mostActiveMonth = month;
      }
    });

    const weekMap = new Set<string>();
    yearWorkouts.forEach((w) => weekMap.add(`${w.year}-${w.week_number}`));

    const streak = calculateStreak(
      workouts.filter((w) => w.completed).map((w) => w.date),
    );

    const typeMap = new Map<string, number>();
    yearWorkouts.forEach((w) => {
      typeMap.set(w.type, (typeMap.get(w.type) ?? 0) + 1);
    });
    let favType = "—";
    let favCount = 0;
    typeMap.forEach((count, type) => {
      if (count > favCount) {
        favCount = count;
        favType = type;
      }
    });

    const typeLabels: Record<string, string> = {
      strength: "Güç",
      cardio: "Kardiyo",
      flexibility: "Esneklik",
      other: "Diğer",
    };

    return {
      total: yearWorkouts.length,
      mostActiveMonth,
      mostActiveCount,
      activeWeeks: weekMap.size,
      streak,
      favType: typeLabels[favType] ?? favType,
    };
  }, [workouts, currentYear]);

  // ── Export ───────────────────────────────────────────
  const summaryRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function handleExportImage() {
    if (!summaryRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: "#07071a",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `pulsar-${currentYear}-ozet.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("📸 Görsel indirildi!");
    } catch {
      showToast("Export başarısız");
    } finally {
      setExporting(false);
    }
  }

  function handleExportJSON() {
    const data = {
      exportDate: new Date().toISOString(),
      year: currentYear,
      summary: yearSummary,
      workouts: workouts.map((w) => ({
        id: w.id,
        title: w.title,
        type: w.type,
        date: w.date,
        completed: w.completed,
        duration_minutes: w.duration_minutes,
        exercises: w.workout_exercises?.map((we) => ({
          name: we.exercise?.name,
          sets: we.sets,
          reps: we.reps,
        })),
      })),
      bodyWeights: bodyWeights.map((bw) => ({
        date: bw.date,
        weight_kg: bw.weight_kg,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.download = `pulsar-${currentYear}-data.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    showToast("📦 JSON indirildi!");
  }

  return (
    <Screen>
      <Header title="Profil" />

      {/* Aylık hedef */}
      <SectionTitle>Bu Ayın Hedefi</SectionTitle>
      <div
        style={{
          margin: "0 16px 10px",
          background: "var(--surface)",
          border: "0.5px solid var(--border)",
          borderRadius: 14,
          padding: 16,
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} color="var(--accent2)" />
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {getMonthName(currentMonth)} {currentYear}
          </span>
        </div>

        {currentGoal && (
          <div style={{ marginBottom: 14 }}>
            <div className="flex justify-between mb-2">
              <span style={{ fontSize: 13, color: "var(--text2)" }}>
                {thisMonthCount} / {currentGoal.target_workout_count} antrenman
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: goalProgress >= 100 ? "var(--mint)" : "var(--accent2)",
                }}
              >
                %{Math.round(goalProgress)}
              </span>
            </div>
            <div
              style={{
                height: 8,
                background: "var(--surface2)",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${goalProgress}%`,
                  background:
                    goalProgress >= 100
                      ? "var(--mint)"
                      : "linear-gradient(to right, var(--accent), var(--accent2))",
                  borderRadius: 99,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            {goalProgress >= 100 && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--mint)",
                  marginTop: 6,
                  fontWeight: 600,
                }}
              >
                🎉 Hedefe ulaştın!
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="number"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            placeholder={
              currentGoal ? "Hedefi güncelle" : "Hedef gir (örn. 12)"
            }
            min={1}
            max={31}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 14,
              background: "var(--surface2)",
              border: "0.5px solid var(--border2)",
              color: "var(--text)",
              outline: "none",
            }}
          />
          <button
            onClick={handleSaveGoal}
            disabled={savingGoal}
            style={{
              padding: "10px 18px",
              background: "var(--accent)",
              border: "none",
              borderRadius: 10,
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              opacity: savingGoal ? 0.6 : 1,
            }}
          >
            {savingGoal ? "..." : currentGoal ? "Güncelle" : "Kaydet"}
          </button>
        </div>
      </div>

      {/* Vücut ağırlığı */}
      <SectionTitle>Vücut Ağırlığı</SectionTitle>
      <div
        style={{
          margin: "0 16px 10px",
          background: "var(--surface)",
          border: "0.5px solid var(--border)",
          borderRadius: 14,
          padding: 16,
        }}
      >
        {latestWeight && (
          <div
            style={{
              marginBottom: 14,
              padding: "10px 14px",
              background: "var(--surface2)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--mint)",
                  lineHeight: 1,
                }}
              >
                {latestWeight.weight_kg}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text2)",
                    marginLeft: 4,
                  }}
                >
                  kg
                </span>
              </p>
              <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
                Son kayıt ·{" "}
                {new Date(latestWeight.date).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <input
            type="number"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="Ağırlık gir (kg)"
            min={20}
            max={300}
            step={0.1}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 14,
              background: "var(--surface2)",
              border: "0.5px solid var(--border2)",
              color: "var(--text)",
              outline: "none",
            }}
          />
          <button
            onClick={handleSaveWeight}
            disabled={savingWeight}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 18px",
              background: "var(--accent)",
              border: "none",
              borderRadius: 10,
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              opacity: savingWeight ? 0.6 : 1,
            }}
          >
            <Plus size={15} />
            {savingWeight ? "..." : "Ekle"}
          </button>
        </div>

        {/* Son 5 kayıt */}
        {bodyWeights.slice(0, 5).map((bw) => (
          <div
            key={bw.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "0.5px solid var(--border)",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text2)" }}>
              {new Date(bw.date).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
              })}
            </span>
            <span
              style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}
            >
              {bw.weight_kg} kg
            </span>
            <button
              onClick={() => handleDeleteWeight(bw.id)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text3)",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Yıl özeti */}
      <SectionTitle>{currentYear} Yıl Özeti</SectionTitle>

      <div
        ref={summaryRef}
        style={{
          margin: "0 16px 10px",
          background: "linear-gradient(135deg, #0d0d24, #12122e)",
          border: "0.5px solid rgba(139,127,255,0.3)",
          borderRadius: 14,
          padding: 20,
        }}
      >
        {/* Başlık */}
        <div className="flex items-center gap-2 mb-4">
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 8px var(--accent)",
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--accent2)",
            }}
          >
            Pulsar · {currentYear}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <SummaryItem
            icon={<Zap size={14} />}
            label="Toplam Antrenman"
            value={String(yearSummary.total)}
            color="var(--accent2)"
          />
          <SummaryItem
            icon={<Calendar size={14} />}
            label="Aktif Hafta"
            value={String(yearSummary.activeWeeks)}
            color="var(--sky)"
          />
          <SummaryItem
            icon={<Trophy size={14} />}
            label="En Aktif Ay"
            value={
              yearSummary.mostActiveMonth > 0
                ? getMonthName(yearSummary.mostActiveMonth)
                : "—"
            }
            color="var(--gold)"
          />
          <SummaryItem
            icon={<Zap size={14} />}
            label="Favori Tip"
            value={yearSummary.favType}
            color="var(--mint)"
          />
        </div>

        {yearSummary.mostActiveMonth > 0 && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(255,209,102,0.06)",
              border: "0.5px solid rgba(255,209,102,0.2)",
              borderRadius: 10,
              fontSize: 13,
              color: "var(--gold)",
            }}
          >
            🏆 {getMonthName(yearSummary.mostActiveMonth)} ayında{" "}
            {yearSummary.mostActiveCount} antrenmanla en aktif ayın!
          </div>
        )}
      </div>

      {/* Export butonları */}
      <SectionTitle>Export</SectionTitle>
      <div
        style={{
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <button
          onClick={handleExportImage}
          disabled={exporting}
          style={{
            width: "100%",
            padding: "14px 20px",
            background: "rgba(139,127,255,0.1)",
            border: "0.5px solid rgba(139,127,255,0.3)",
            borderRadius: 12,
            color: "var(--accent2)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            opacity: exporting ? 0.6 : 1,
          }}
        >
          <Download size={16} />
          {exporting ? "Hazırlanıyor..." : "Yıl Özetini PNG İndir"}
        </button>

        <button
          onClick={handleExportJSON}
          style={{
            width: "100%",
            padding: "14px 20px",
            background: "rgba(6,214,160,0.08)",
            border: "0.5px solid rgba(6,214,160,0.25)",
            borderRadius: 12,
            color: "var(--mint)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Download size={16} />
          Tüm Veriyi JSON İndir
        </button>
      </div>

      <div style={{ height: 20 }} />
    </Screen>
  );
}

// ── Yıl özeti satır komponenti ───────────────────────
function SummaryItem({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "0.5px solid rgba(255,255,255,0.06)",
        borderRadius: 10,
        padding: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color,
          marginBottom: 6,
        }}
      >
        {icon}
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <p
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "var(--text)",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}
