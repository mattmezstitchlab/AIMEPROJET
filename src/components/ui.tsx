import type { ReactNode } from "react";

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-chalk-dim shrink-0">{children}</span>
  );
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-[3px]">
      <div className="w-[78px] shrink-0">
        <Label>{label}</Label>
      </div>
      <div className="flex-1 min-w-0 flex items-center gap-1.5">{children}</div>
    </div>
  );
}

export function Num({
  value,
  onChange,
  min = -10,
  max = 20,
  step = 0.25,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1 min-w-0"
      />
      <input
        type="number"
        value={Number.isFinite(value) ? +value.toFixed(2) : 0}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-[52px] bg-vault-3 border border-line px-1 py-[2px] font-mono text-[10px] text-chalk focus:border-vermillon outline-none"
      />
    </>
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="flex-1 min-w-0 bg-vault-3 border border-line px-1.5 py-[3px] font-mono text-[10px] text-chalk focus:border-vermillon outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`font-mono text-[9.5px] uppercase tracking-[0.14em] px-2 py-[3px] border transition-colors ${
        on ? "border-vermillon bg-vermillon/15 text-vermillon" : "border-line text-chalk-dim hover:text-chalk"
      }`}
    >
      {label}
    </button>
  );
}

export function Group({ titre, children, open = true }: { titre: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="border-b border-line/70 group">
      <summary className="cursor-pointer list-none px-3 py-2 flex items-center justify-between hover:bg-vault-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-chalk">{titre}</span>
        <span className="text-chalk-dim text-[10px] group-open:rotate-90 transition-transform">›</span>
      </summary>
      <div className="px-3 pb-3 pt-1">{children}</div>
    </details>
  );
}

export function Btn({
  children,
  onClick,
  active,
  tone = "neutre",
  title,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  tone?: "neutre" | "accent" | "danger";
  title?: string;
  className?: string;
}) {
  const tones = {
    neutre: "border-line text-chalk-dim hover:text-chalk hover:border-chalk-dim",
    accent: "border-vermillon/60 text-vermillon hover:bg-vermillon hover:text-vault",
    danger: "border-line text-chalk-dim hover:border-red-500/60 hover:text-red-400",
  };
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`font-mono text-[10px] uppercase tracking-[0.14em] px-2.5 py-1.5 border transition-colors ${
        active ? "border-vermillon bg-vermillon/15 text-vermillon" : tones[tone]
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Tag({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="font-mono text-[9px] uppercase tracking-[0.16em] px-1.5 py-0.5 border"
      style={{ borderColor: (color ?? "#3a3329") + "88", color: color ?? "#9a9181" }}
    >
      {children}
    </span>
  );
}
