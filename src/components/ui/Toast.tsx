import { useEffect } from "react";
import { useApp } from "../../lib/AppContext";

export function Toast() {
  const { toast, clearToast } = useApp();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 2800);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div
      className="animate-toast"
      style={{
        position: "fixed",
        top: 56,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        pointerEvents: "none",
        background: "var(--surface2)",
        border: "0.5px solid var(--border2)",
        borderRadius: 99,
        padding: "10px 20px",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--text)",
        whiteSpace: "nowrap",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      {toast}
    </div>
  );
}
