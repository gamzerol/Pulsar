import { ReactNode, ButtonHTMLAttributes } from "react";

// ── Card ─────────────────────────────────────────────
interface CardProps {
  children: ReactNode;
  accent?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, accent, onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: `0.5px solid ${accent ? "rgba(139,127,255,0.3)" : "var(--border)"}`,
        borderRadius: 14,
        padding: "14px 16px",
        margin: "0 16px 10px",
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Button ────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: ReactNode;
}

const btnVariants = {
  primary: { background: "var(--accent)", color: "white", border: "none" },
  secondary: {
    background: "var(--surface2)",
    color: "var(--text)",
    border: "0.5px solid var(--border2)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text2)",
    border: "0.5px solid var(--border)",
  },
  danger: {
    background: "rgba(255,107,157,0.15)",
    color: "var(--coral)",
    border: "0.5px solid rgba(255,107,157,0.3)",
  },
};

const btnSizes = {
  sm: { padding: "7px 14px", fontSize: 12, borderRadius: 8 },
  md: { padding: "11px 18px", fontSize: 14, borderRadius: 10 },
  lg: { padding: "14px 22px", fontSize: 15, borderRadius: 12 },
};

export function Button({
  variant = "secondary",
  size = "md",
  fullWidth,
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s",
        width: fullWidth ? "100%" : undefined,
        ...btnVariants[variant],
        ...btnSizes[size],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── SectionTitle ──────────────────────────────────────
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text3)",
        padding: "0 20px",
        margin: "20px 0 10px",
      }}
    >
      {children}
    </p>
  );
}

// ── StatCard ──────────────────────────────────────────
interface StatCardProps {
  value: string | number;
  label: string;
  unit?: string;
  color?: string;
}

export function StatCard({ value, label, unit, color }: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border)",
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: -1,
          color: color ?? "var(--text)",
          lineHeight: 1,
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--text2)",
              marginLeft: 2,
            }}
          >
            {unit}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 24px",
        color: "var(--text3)",
      }}
    >
      {icon && (
        <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.4 }}>
          {icon}
        </div>
      )}
      <p
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--text2)",
          marginBottom: 6,
        }}
      >
        {title}
      </p>
      {description && (
        <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────
interface BadgeProps {
  children: ReactNode;
  color?: string;
}

export function Badge({ children, color = "var(--accent)" }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 99,
        background: color + "22",
        color,
        border: `0.5px solid ${color}44`,
      }}
    >
      {children}
    </span>
  );
}

// ── Input ─────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, style, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label
          style={{
            fontSize: 12,
            color: "var(--text2)",
            display: "block",
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: 10,
          fontSize: 14,
          background: "var(--surface2)",
          border: "0.5px solid var(--border2)",
          color: "var(--text)",
          outline: "none",
          ...style,
        }}
      />
    </div>
  );
}

// ── Select ────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, style, ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label
          style={{
            fontSize: 12,
            color: "var(--text2)",
            display: "block",
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          {label}
        </label>
      )}
      <select
        {...props}
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: 10,
          fontSize: 14,
          background: "var(--surface2)",
          border: "0.5px solid var(--border2)",
          color: "var(--text)",
          outline: "none",
          appearance: "none",
          ...style,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, style, ...props }: TextareaProps) {
  return (
    <div>
      {label && (
        <label
          style={{
            fontSize: 12,
            color: "var(--text2)",
            display: "block",
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          {label}
        </label>
      )}
      <textarea
        {...props}
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: 10,
          fontSize: 14,
          background: "var(--surface2)",
          border: "0.5px solid var(--border2)",
          color: "var(--text)",
          outline: "none",
          resize: "none",
          minHeight: 80,
          ...style,
        }}
      />
    </div>
  );
}
