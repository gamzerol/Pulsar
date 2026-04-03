import { AppProvider, useApp } from "./lib/AppContext";
import { StarBackground } from "./components/ui/StarBackground";
import { BottomNav } from "./components/layout/BottomNavs";
import { Toast } from "./components/ui/Toast";

function HomePage() {
  return (
    <div
      className="flex-1 overflow-y-auto hide-scrollbar relative z-10"
      style={{ paddingBottom: 88 }}
    >
      <div style={{ padding: "52px 20px 16px" }}>
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
          Merhaba,{" "}
          <em style={{ color: "var(--accent2)", fontStyle: "normal" }}>
            Gamze
          </em>
        </h1>
        <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 3 }}>
          Modül 1 tamamlandı ✅
        </p>
      </div>

      <div
        style={{
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            background: "var(--surface)",
            border: "0.5px solid var(--border)",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
            Altyapı hazır 🚀 Supabase bağlantısı, global state, routing ve tüm
            UI primitive'ler tamam.
          </p>
        </div>
        <ConnectionStatus />
      </div>
    </div>
  );
}

function ConnectionStatus() {
  const { connected, loading } = useApp();
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border)",
        borderRadius: 14,
        padding: 16,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text3)",
          marginBottom: 8,
        }}
      >
        Supabase Bağlantısı
      </p>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          padding: "5px 12px",
          borderRadius: 99,
          background: loading
            ? "rgba(139,127,255,0.1)"
            : connected
              ? "rgba(6,214,160,0.1)"
              : "rgba(255,107,157,0.1)",
          color: loading
            ? "var(--accent2)"
            : connected
              ? "var(--mint)"
              : "var(--coral)",
          border: `0.5px solid ${loading ? "rgba(139,127,255,0.25)" : connected ? "rgba(6,214,160,0.25)" : "rgba(255,107,157,0.25)"}`,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "currentColor",
            display: "inline-block",
            animation: "pulseDot 1.5s ease-in-out infinite",
          }}
        />
        {loading
          ? "Bağlanıyor..."
          : connected
            ? "Bağlantı başarılı"
            : "Bağlantı hatası"}
      </span>
    </div>
  );
}

function PlaceholderPage({ label }: { label: string }) {
  return (
    <div
      className="flex-1 overflow-y-auto hide-scrollbar relative z-10 flex items-center justify-center"
      style={{ paddingBottom: 88 }}
    >
      <div style={{ textAlign: "center", color: "var(--text3)" }}>
        <p style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>🚧</p>
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text2)" }}>
          {label}
        </p>
        <p style={{ fontSize: 13, marginTop: 4 }}>Yakında geliyor</p>
      </div>
    </div>
  );
}

function Router() {
  const { activeTab } = useApp();
  switch (activeTab) {
    case "home":
      return <HomePage />;
    case "workout":
      return <PlaceholderPage label="Antrenman" />;
    case "galaxy":
      return <PlaceholderPage label="Galaksi" />;
    case "reports":
      return <PlaceholderPage label="Raporlar" />;
    case "profile":
      return <PlaceholderPage label="Profil" />;
    default:
      return <HomePage />;
  }
}

function AppShell() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 14,
        }}
      >
        <StarBackground />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: "0 0 20px var(--accent)",
            animation: "pulseDot 1s ease-in-out infinite",
          }}
        />
        <p
          style={{
            fontSize: 13,
            color: "var(--text2)",
            letterSpacing: "0.05em",
          }}
        >
          Pulsar yükleniyor...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
      }}
    >
      <StarBackground />
      <Router />
      <BottomNav />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
