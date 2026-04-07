import { useEffect, useRef, useState, useMemo } from "react";
import { useApp } from "../lib/AppContext";
import { Workout } from "../types";
import { getMonthName } from "../lib/utils";

interface WeekStar {
  weekKey: string;
  week: number;
  year: number;
  month: number;
  workoutCount: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
  color: string;
  workouts: Workout[];
}

interface MonthPlanet {
  monthKey: string;
  month: number;
  year: number;
  workoutCount: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  ringColor: string;
}

const STAR_COLORS = [
  "#dbd6ff",
  "#b8aeff",
  "#8b7fff",
  "#4cc9f0",
  "#06d6a0",
  "#ffd166",
  "#ff6b9d",
];

const PLANET_COLORS = [
  { body: "#4cc9f0", ring: "rgba(76,201,240,0.3)" },
  { body: "#8b7fff", ring: "rgba(139,127,255,0.3)" },
  { body: "#06d6a0", ring: "rgba(6,214,160,0.3)" },
  { body: "#ffd166", ring: "rgba(255,209,102,0.3)" },
  { body: "#ff6b9d", ring: "rgba(255,107,157,0.3)" },
];

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export function GalaxyPage() {
  const { workouts } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [selected, setSelected] = useState<WeekStar | null>(null);

  // Haftalık yıldızları hesapla
  const weekStars = useMemo<WeekStar[]>(() => {
    const map = new Map<string, Workout[]>();
    workouts
      .filter((w) => w.completed)
      .forEach((w) => {
        const key = `${w.year}-${w.week_number}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(w);
      });

    const stars: WeekStar[] = [];
    let i = 0;
    map.forEach((wList, key) => {
      const [year, week] = key.split("-").map(Number);
      const firstDate = new Date(wList[0].date);
      const month = firstDate.getMonth() + 1;
      const seed = year * 100 + week;
      const angle = seededRandom(seed * 3) * Math.PI * 2;
      const dist = 80 + seededRandom(seed * 7) * 160;
      stars.push({
        weekKey: key,
        week,
        year,
        month,
        workoutCount: wList.length,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        radius: 3 + Math.min(wList.length, 5) * 1.2,
        opacity: 0.6 + Math.min(wList.length / 7, 1) * 0.4,
        color: STAR_COLORS[i % STAR_COLORS.length],
        workouts: wList,
      });
      i++;
    });
    return stars;
  }, [workouts]);

  // Aylık gezegenleri hesapla
  const monthPlanets = useMemo<MonthPlanet[]>(() => {
    const map = new Map<string, number>();
    workouts
      .filter((w) => w.completed)
      .forEach((w) => {
        const d = new Date(w.date);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        map.set(key, (map.get(key) ?? 0) + 1);
      });

    const planets: MonthPlanet[] = [];
    let i = 0;
    map.forEach((count, key) => {
      const [year, month] = key.split("-").map(Number);
      const seed = year * 12 + month;
      const angle = (i / map.size) * Math.PI * 2 + seededRandom(seed) * 0.5;
      const dist = 260 + seededRandom(seed * 5) * 60;
      const pc = PLANET_COLORS[i % PLANET_COLORS.length];
      planets.push({
        monthKey: key,
        month,
        year,
        workoutCount: count,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        radius: 10 + Math.min(count, 20) * 0.8,
        color: pc.body,
        ringColor: pc.ring,
      });
      i++;
    });
    return planets;
  }, [workouts]);

  // Canvas çiz
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    let t = 0;

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      // Arka plan
      ctx!.fillStyle = "#07071a";
      ctx!.fillRect(0, 0, W, H);

      // Arka plan yıldızları (dekoratif)
      for (let i = 0; i < 120; i++) {
        const bx = seededRandom(i * 17) * W;
        const by = seededRandom(i * 31) * H;
        const br = seededRandom(i * 7) * 1.2 + 0.2;
        const bo =
          0.05 + seededRandom(i * 13) * 0.2 + Math.sin(t * 0.02 + i) * 0.05;
        ctx!.beginPath();
        ctx!.arc(bx, by, br, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${bo})`;
        ctx!.fill();
      }

      // Merkez nebula
      const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 120);
      grad.addColorStop(0, "rgba(139,127,255,0.15)");
      grad.addColorStop(0.5, "rgba(76,201,240,0.05)");
      grad.addColorStop(1, "transparent");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, W, H);

      // Merkez yıldız (güneş)
      const sunGlow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 24);
      sunGlow.addColorStop(0, "rgba(255,255,255,0.9)");
      sunGlow.addColorStop(0.3, "rgba(184,174,255,0.6)");
      sunGlow.addColorStop(1, "transparent");
      ctx!.fillStyle = sunGlow;
      ctx!.fillRect(cx - 24, cy - 24, 48, 48);

      ctx!.beginPath();
      ctx!.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx!.fillStyle = "white";
      ctx!.fill();

      // Gezegenler
      monthPlanets.forEach((p, i) => {
        const px = cx + p.x + Math.sin(t * 0.005 + i) * 3;
        const py = cy + p.y + Math.cos(t * 0.005 + i) * 3;

        // Halka
        ctx!.beginPath();
        ctx!.ellipse(
          px,
          py,
          p.radius * 2.2,
          p.radius * 0.5,
          0.4,
          0,
          Math.PI * 2,
        );
        ctx!.strokeStyle = p.ringColor;
        ctx!.lineWidth = 3;
        ctx!.stroke();

        // Gezegen gölgesi
        const pGlow = ctx!.createRadialGradient(
          px,
          py,
          0,
          px,
          py,
          p.radius * 1.5,
        );
        pGlow.addColorStop(0, p.color + "40");
        pGlow.addColorStop(1, "transparent");
        ctx!.fillStyle = pGlow;
        ctx!.beginPath();
        ctx!.arc(px, py, p.radius * 1.5, 0, Math.PI * 2);
        ctx!.fill();

        // Gezegen
        ctx!.beginPath();
        ctx!.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.fill();

        // Ay sayısı etiketi
        ctx!.fillStyle = "rgba(255,255,255,0.7)";
        ctx!.font = `bold ${Math.max(9, p.radius * 0.7)}px -apple-system`;
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillText(String(p.workoutCount), px, py);
      });

      // Yıldızlar
      weekStars.forEach((s, i) => {
        const sx = cx + s.x + Math.sin(t * 0.01 + i * 0.5) * 1.5;
        const sy = cy + s.y + Math.cos(t * 0.01 + i * 0.5) * 1.5;
        const pulse = Math.sin(t * 0.03 + i) * 0.15;

        // Dış glow (gezegen seviyesinde)
        const outerGlow = ctx!.createRadialGradient(
          sx,
          sy,
          0,
          sx,
          sy,
          s.radius * 6,
        );
        outerGlow.addColorStop(0, s.color + "55");
        outerGlow.addColorStop(0.4, s.color + "25");
        outerGlow.addColorStop(1, "transparent");
        ctx!.fillStyle = outerGlow;
        ctx!.beginPath();
        ctx!.arc(sx, sy, s.radius * 6, 0, Math.PI * 2);
        ctx!.fill();

        // İç glow
        const innerGlow = ctx!.createRadialGradient(
          sx,
          sy,
          0,
          sx,
          sy,
          s.radius * 2.5,
        );
        innerGlow.addColorStop(0, s.color + "cc");
        innerGlow.addColorStop(0.5, s.color + "66");
        innerGlow.addColorStop(1, "transparent");
        ctx!.fillStyle = innerGlow;
        ctx!.beginPath();
        ctx!.arc(sx, sy, s.radius * 2.5, 0, Math.PI * 2);
        ctx!.fill();

        // Yıldız çekirdeği
        ctx!.beginPath();
        ctx!.arc(sx, sy, s.radius + pulse, 0, Math.PI * 2);
        ctx!.fillStyle = "white";
        ctx!.globalAlpha = s.opacity;
        ctx!.fill();
        ctx!.globalAlpha = 1;

        // Seçili yıldız halkası
        if (selected?.weekKey === s.weekKey) {
          ctx!.beginPath();
          ctx!.arc(sx, sy, s.radius + 6, 0, Math.PI * 2);
          ctx!.strokeStyle = s.color;
          ctx!.lineWidth = 1.5;
          ctx!.stroke();
        }
      });

      t++;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [weekStars, monthPlanets, selected]);

  // Canvas boyutunu ayarla
  useEffect(() => {
    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = canvas.parentElement?.clientWidth ?? 390;
      const h = canvas.parentElement?.clientHeight ?? 500;
      canvas.width = w;
      canvas.height = h;
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Yıldıza tıkla
  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (const s of weekStars) {
      const sx = cx + s.x;
      const sy = cy + s.y;
      const dist = Math.sqrt((mx - sx) ** 2 + (my - sy) ** 2);
      if (dist < s.radius + 10) {
        setSelected((prev) => (prev?.weekKey === s.weekKey ? null : s));
        return;
      }
    }
    setSelected(null);
  }

  const totalStars = weekStars.length;
  const totalPlanets = monthPlanets.length;

  return (
    <div
      className="flex-1 relative z-10 flex flex-col"
      style={{ paddingBottom: 88, overflow: "hidden" }}
    >
      {/* Header */}
      <div
        style={{
          padding: "52px 20px 12px",
          position: "relative",
          zIndex: 2,
          background: "linear-gradient(to bottom, var(--bg) 65%, transparent)",
          flexShrink: 0,
        }}
      >
        <div className="flex items-center gap-2 mb-1">
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
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text2)",
            }}
          >
            Pulsar
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" }}>
          Galaksin{" "}
          <em style={{ color: "var(--accent2)", fontStyle: "normal" }}>🌌</em>
        </h1>

        {/* İstatistik rozetleri */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(139,127,255,0.1)",
              border: "0.5px solid rgba(139,127,255,0.25)",
              borderRadius: 99,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--accent2)",
            }}
          >
            ✦ {totalStars} yıldız
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(76,201,240,0.1)",
              border: "0.5px solid rgba(76,201,240,0.25)",
              borderRadius: 99,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--sky)",
            }}
          >
            🪐 {totalPlanets} gezegen
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            cursor: "pointer",
          }}
          onClick={handleCanvasClick}
        />

        {/* Seçili yıldız detay kartı */}
        {selected && (
          <div
            className="animate-slide-up"
            style={{
              position: "absolute",
              bottom: 12,
              left: 16,
              right: 16,
              background: "rgba(18,18,46,0.95)",
              border: `0.5px solid ${selected.color}44`,
              borderRadius: 16,
              padding: 16,
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: selected.color,
                  }}
                >
                  ✦ {selected.year} · {selected.week}. Hafta
                </p>
                <p
                  style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}
                >
                  {getMonthName(selected.month)} · {selected.workoutCount}{" "}
                  antrenman
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text3)",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {selected.workouts.map((w) => (
                <div
                  key={w.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 8,
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text)" }}>
                    {w.title}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>
                    {new Date(w.date).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Boş durum */}
        {weekStars.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              pointerEvents: "none",
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "var(--text3)",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              Galaksin henüz boş ✨{"\n"}
              İlk antrenmandan sonra{"\n"}
              yıldızın doğacak
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
