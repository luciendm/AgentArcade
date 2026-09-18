import { useMemo } from "react";

interface ConfettiProps { count?: number; }

const COLORS = [
  "oklch(0.7 0.2 340)",
  "oklch(0.72 0.2 25)",
  "oklch(0.7 0.2 195)",
  "oklch(0.78 0.18 90)",
  "oklch(0.62 0.22 145)",
  "oklch(0.6 0.25 295)",
];

export function Confetti({ count = 60 }: ConfettiProps) {
  const pieces = useMemo(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2 + Math.random() * 2,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 360,
    })), [count]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-40" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-20px] rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s cubic-bezier(.2,.6,.4,1) ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
