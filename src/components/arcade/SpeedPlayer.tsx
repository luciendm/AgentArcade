import { useEffect, useMemo, useRef, useState } from "react";
import { Timer, Zap } from "lucide-react";
import type { SpeedPayload } from "@/lib/arcade-data";

interface Props {
  payload: SpeedPayload;
  onFinish: (correctCount: number, total: number) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SpeedPlayer({ payload, onFinish }: Props) {
  const items = useMemo(() => shuffle(payload.items), [payload.items]);
  const total = items.length;
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(payload.seconds);
  const finishedRef = useRef(false);
  const correctRef = useRef(0);

  useEffect(() => { correctRef.current = correct; }, [correct]);

  useEffect(() => {
    if (finishedRef.current) return;
    const t = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(t);
          if (!finishedRef.current) {
            finishedRef.current = true;
            setTimeout(() => onFinish(correctRef.current, total), 200);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(i: number) {
    if (flash || finishedRef.current) return;
    const current = items[idx];
    const isRight = i === current.correctIndex;
    if (isRight) {
      setCorrect(c => c + 1);
      setCombo(c => {
        const nxt = c + 1;
        setBestCombo(b => Math.max(b, nxt));
        return nxt;
      });
      setFlash("correct");
    } else {
      setCombo(0);
      setFlash("wrong");
    }
    setTimeout(() => {
      setFlash(null);
      if (idx + 1 >= total) {
        finishedRef.current = true;
        onFinish(isRight ? correctRef.current + 1 : correctRef.current, total);
      } else {
        setIdx(i2 => i2 + 1);
      }
    }, 350);
  }

  const timePct = (secondsLeft / payload.seconds) * 100;
  const current = items[idx];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-bold">
          <Timer className="h-4 w-4" /> {secondsLeft}s
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-3 py-1 text-sm font-bold">
          <Zap className="h-4 w-4" /> Combo x{combo} \u00B7 Best x{bestCombo}
        </div>
        <div className="text-sm font-semibold">
          <span className="text-emerald-600 font-black">{correct}</span>
          <span className="text-muted-foreground"> correct \u00B7 {idx + (flash ? 1 : 0)}/{total}</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-amber-400 transition-[width] duration-1000" style={{ width: `${timePct}%` }} />
      </div>

      {current && (
        <div
          key={current.id}
          className={[
            "rounded-2xl border bg-card shadow-sm p-5 md:p-6 animate-pop-in",
            flash === "correct" ? "ring-4 ring-emerald-400/60" : "",
            flash === "wrong" ? "ring-4 ring-red-400/60 animate-shake" : "",
          ].join(" ")}
        >
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Rapid-fire</div>
          <h3 className="mt-1 text-xl md:text-2xl font-black">{current.prompt}</h3>
          <div className="mt-4 grid sm:grid-cols-2 gap-2">
            {current.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                disabled={!!flash}
                className="text-left rounded-xl border bg-background px-4 py-3 font-semibold hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-70"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
