import { AppProvider, useApp } from "./lib/AppContext";
import { StarBackground } from "./components/ui/StarBackground";
import { BottomNav } from "./components/layout/BottomNavs";
import { Toast } from "./components/ui/Toast";
import { HomePage } from "./pages/HomePage";
import { WorkoutPage } from "./pages/WorkoutPage";
import { LibraryPage } from "./pages/LibraryPage";
import { GalaxyPage } from "./pages/GalaxyPage";
import { ReportsPage } from "./pages/ReportsPage";

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
      return <WorkoutPage />;
    case "galaxy":
      return <GalaxyPage />;
    case "reports":
      return <ReportsPage />;
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
