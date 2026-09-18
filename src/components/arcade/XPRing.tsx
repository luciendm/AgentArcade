import { useEffect, useState } from "react";

interface XPRingProps {
  pct: number; // 0..1
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}

export function XPRing({ pct, size = 160, stroke = 14, label, sublabel }: XPRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(pct), 60);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="xp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.6 0.25 295)" />
            <stop offset="50%" stopColor="oklch(0.65 0.22 330)" />
            <stop offset="100%" stopColor="oklch(0.72 0.2 25)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(0.92 0.02 300)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#xp-grad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - c * animated}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.2,.9,.3,1.2)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-2xl font-black tracking-tight">{label}</div>
          {sublabel && <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}
