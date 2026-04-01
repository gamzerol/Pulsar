import { ReactNode } from "react";

interface ScreenProps {
  children: ReactNode;
}

export function Screen({ children }: ScreenProps) {
  return (
    <div
      className="flex-1 overflow-y-auto hide-scrollbar relative z-10"
      style={{ paddingBottom: 88 }}
    >
      {children}
    </div>
  );
}

interface HeaderProps {
  title: string;
  titleAccent?: string;
  subtitle?: string;
  right?: ReactNode;
}

export function Header({ title, titleAccent, subtitle, right }: HeaderProps) {
  return (
    <div
      className="sticky top-0 z-20 px-5"
      style={{
        paddingTop: 52,
        paddingBottom: 14,
        background: "linear-gradient(to bottom, var(--bg) 65%, transparent)",
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
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
        {right}
      </div>

      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "-0.5px",
          lineHeight: 1.2,
        }}
      >
        {title}{" "}
        {titleAccent && (
          <em style={{ color: "var(--accent2)", fontStyle: "normal" }}>
            {titleAccent}
          </em>
        )}
      </h1>

      {subtitle && (
        <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 3 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
