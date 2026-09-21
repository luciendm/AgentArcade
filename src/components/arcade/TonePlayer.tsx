import { useState } from "react";
import { Check, Sparkles, X, Headphones } from "lucide-react";
import type { TonePayload } from "@/lib/arcade-data";

interface Props {
  payload: TonePayload;
  onFinish: (correctCount: number, total: number) => void;
}

export function TonePlayer({ payload, onFinish }: Props) {
  const total = payload.items.length;
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState(0);

  const current = payload.items[idx];
  const pct = ((idx + (locked ? 1 : 0)) / total) * 100;

  function handleSelect(choice: string) {
    if (locked) return;
    setSelected(choice);
    setLocked(true);
    if (choice === current.correctTone) setCorrect(c => c + 1);
  }

  function handleNext() {
    if (idx + 1 >= total) {
      onFinish(correct, total);
      return;
    }
    setIdx(i => i + 1);
    setSelected(null);
    setLocked(false);
  }

  const isCorrect = selected === current?.correctTone;

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-muted-foreground">
        Clip <span className="text-foreground font-black">{idx + 1}</span> / {total}
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full gradient-hero transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>

      {current && (
        <div key={current.id} className="rounded-2xl border bg-card shadow-sm p-5 md:p-6 animate-rise-in">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Member says…</div>
          <div className="mt-2 rounded-2xl bg-gradient-to-br from-sky-50 to-white border p-4 text-lg md:text-xl leading-relaxed flex items-start gap-3">
            <Headphones className="h-6 w-6 text-primary shrink-0 mt-1" />
            <span>{current.line}</span>
          </div>

          <div className="mt-5 text-sm font-semibold text-muted-foreground">What tone are they using?</div>
          <div className="mt-2 grid sm:grid-cols-2 gap-2">
            {current.choices.map(choice => {
              const isSel = selected === choice;
              const isRight = choice === current.correctTone;
              const showState = locked;
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => handleSelect(choice)}
                  disabled={locked}
                  className={[
                    "text-left rounded-xl border px-4 py-3 font-semibold transition-all",
                    !locked && "hover:border-primary hover:bg-primary/5",
                    showState && isRight && "border-emerald-500 bg-emerald-50 text-emerald-900",
                    showState && isSel && !isRight && "border-red-500 bg-red-50 text-red-900",
                    !showState && isSel && "border-primary bg-primary/5",
                  ].filter(Boolean).join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <span className={[
                      "h-7 w-7 rounded-full grid place-items-center text-xs font-black shrink-0",
                      showState && isRight ? "bg-emerald-500 text-white" :
                        showState && isSel && !isRight ? "bg-red-500 text-white" :
                          "bg-secondary text-secondary-foreground",
                    ].join(" ")}>
                      {showState && isRight ? <Check className="h-4 w-4" /> :
                        showState && isSel && !isRight ? <X className="h-4 w-4" /> :
                          <Headphones className="h-3.5 w-3.5" />}
                    </span>
                    <span>{choice}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {locked && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className={[
                "rounded-xl px-4 py-3 text-sm font-medium max-w-xl animate-rise-in",
                isCorrect ? "bg-emerald-50 text-emerald-900 border border-emerald-200" :
                  "bg-red-50 text-red-900 border border-red-200",
              ].join(" ")}>
                <div className="font-bold flex items-center gap-2">
                  {isCorrect ? <><Sparkles className="h-4 w-4" /> Great ear!</> : <><X className="h-4 w-4" /> The tone was {current.correctTone}.</>}
                </div>
                <div className="mt-1">{current.explanation}</div>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2 shadow hover:scale-[1.02] transition-transform"
              >
                {idx + 1 >= total ? "Finish" : "Next clip"} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
