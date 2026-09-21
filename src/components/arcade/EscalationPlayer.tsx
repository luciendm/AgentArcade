import { useState } from "react";
import { Check, Siren, X, Angry } from "lucide-react";
import type { EscalationPayload } from "@/lib/arcade-data";

interface Props {
  payload: EscalationPayload;
  onFinish: (correctCount: number, total: number) => void;
}

export function EscalationPlayer({ payload, onFinish }: Props) {
  const total = payload.turns.length;
  const [idx, setIdx] = useState(0);
  const [meter, setMeter] = useState(payload.startMeter);
  const [lockedIdx, setLockedIdx] = useState<number | null>(null);
  const [good, setGood] = useState(0);
  const [failed, setFailed] = useState(false);

  const current = payload.turns[idx];

  function pick(i: number) {
    if (lockedIdx !== null || failed) return;
    const opt = current.options[i];
    const newMeter = Math.max(0, Math.min(100, meter + opt.delta));
    setMeter(newMeter);
    setLockedIdx(i);
    if (opt.delta < 0) setGood(g => g + 1);
    if (newMeter >= payload.targetMax) {
      setFailed(true);
      setTimeout(() => onFinish(good + (opt.delta < 0 ? 1 : 0), total), 1200);
    }
  }

  function next() {
    if (idx + 1 >= total || failed) {
      onFinish(good, total);
      return;
    }
    setIdx(i => i + 1);
    setLockedIdx(null);
  }

  const meterColor =
    meter < 40 ? "bg-emerald-500" :
      meter < 70 ? "bg-amber-400" :
        "bg-red-500";
  const meterLabel =
    meter < 40 ? "Calm" :
      meter < 70 ? "Tense" :
        meter < 90 ? "Heated" : "Boiling";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 font-bold">
            <Siren className={`h-5 w-5 ${meter >= 70 ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
            Member frustration · <span className="text-sm font-semibold">{meterLabel}</span>
          </div>
          <div className="text-sm font-black tabular-nums">{Math.round(meter)}%</div>
        </div>
        <div className="mt-2 h-4 rounded-full bg-muted overflow-hidden relative">
          <div
            className={`h-full ${meterColor} transition-all duration-500`}
            style={{ width: `${meter}%` }}
          />
          <div
            className="absolute inset-y-0 border-r-2 border-red-600"
            style={{ left: `${payload.targetMax}%` }}
            title="Boiling point"
          />
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground text-right">Keep it under {payload.targetMax}% to keep the call.</div>
      </div>

      {failed ? (
        <div className="rounded-2xl border bg-red-50 border-red-200 p-6 text-center animate-pop-in">
          <Angry className="h-14 w-14 text-red-500 mx-auto" />
          <div className="mt-2 text-xl font-black text-red-900">The call boiled over.</div>
          <div className="text-sm text-red-900/80 mt-1">Don't sweat it — replay to practice a softer landing.</div>
        </div>
      ) : current && (
        <div key={current.id} className="rounded-2xl border bg-card shadow-sm p-5 md:p-6 animate-rise-in">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Turn {idx + 1} of {total} · Member says…</div>
          <div className="mt-2 rounded-2xl bg-gradient-to-br from-red-50 to-white border p-4 text-lg leading-relaxed flex items-start gap-3">
            <Angry className="h-6 w-6 text-red-500 shrink-0 mt-1" />
            <span>{current.memberLine}</span>
          </div>

          <div className="mt-5 text-sm font-semibold text-muted-foreground">Your response:</div>
          <div className="mt-2 grid gap-2">
            {current.options.map((opt, i) => {
              const chosen = lockedIdx === i;
              const showState = lockedIdx !== null;
              const wasGood = opt.delta < 0;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(i)}
                  disabled={lockedIdx !== null}
                  className={[
                    "text-left rounded-xl border px-4 py-3 font-medium transition-all",
                    !showState && "hover:border-primary hover:bg-primary/5",
                    showState && chosen && wasGood && "border-emerald-500 bg-emerald-50 text-emerald-900",
                    showState && chosen && !wasGood && "border-red-500 bg-red-50 text-red-900",
                    showState && !chosen && "opacity-60",
                  ].filter(Boolean).join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <span className={[
                      "h-7 w-7 rounded-full grid place-items-center text-xs font-black shrink-0 mt-0.5",
                      showState && chosen && wasGood ? "bg-emerald-500 text-white" :
                        showState && chosen && !wasGood ? "bg-red-500 text-white" :
                          "bg-secondary text-secondary-foreground",
                    ].join(" ")}>
                      {showState && chosen && wasGood ? <Check className="h-4 w-4" /> :
                        showState && chosen && !wasGood ? <X className="h-4 w-4" /> :
                          String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {showState && chosen && (
                      <span className={`text-xs font-black tabular-nums ${wasGood ? "text-emerald-700" : "text-red-700"}`}>
                        {opt.delta > 0 ? `+${opt.delta}` : opt.delta}
                      </span>
                    )}
                  </div>
                  {showState && chosen && (
                    <div className="mt-2 text-sm">{opt.feedback}</div>
                  )}
                </button>
              );
            })}
          </div>

          {lockedIdx !== null && (
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2 shadow hover:scale-[1.02] transition-transform"
              >
                {idx + 1 >= total ? "Finish mission" : "Next turn"} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
