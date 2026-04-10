import { Home, Dumbbell, Sparkles, BarChart2, User } from "lucide-react";
import { useApp } from "../../lib/AppContext";
import { TabId } from "../../types";

const tabs: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: "home", label: "Ana Sayfa", Icon: Home },
  { id: "workout", label: "Antrenman", Icon: Dumbbell },
  { id: "galaxy", label: "Galaksi", Icon: Sparkles },
  { id: "reports", label: "Raporlar", Icon: BarChart2 },
  { id: "profile", label: "Profil", Icon: User },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav
      className="fixed bottom-0 left-1/2 w-full z-50 px-3"
      style={{
        maxWidth: 430,
        transform: "translateX(-50%)",
        paddingBottom: 28,
        paddingTop: 8,
        background: "linear-gradient(to top, var(--bg) 65%, transparent)",
      }}
    >
      <div
        className="flex"
        style={{
          background: "var(--surface)",
          border: "0.5px solid var(--border2)",
          borderRadius: 20,
          padding: 6,
        }}
      >
        {tabs.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              data-testid={`tab-${id}`}
              className="flex-1 flex flex-col items-center gap-1 transition-all duration-200"
              style={{
                padding: "8px 4px",
                borderRadius: 14,
                border: "none",
                background: active ? "var(--surface2)" : "transparent",
                color: active ? "var(--accent2)" : "var(--text3)",
                cursor: "pointer",
              }}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.8} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
