import { useMemo, useRef, useState, useEffect } from "react";
import { Check, Eye, X } from "lucide-react";
import type { CrosswordPayload } from "@/lib/arcade-data";

interface Props {
  payload: CrosswordPayload;
  onFinish: (correctCount: number, total: number) => void;
}

interface CellRef {
  clueIdx: number;
  letterIdx: number;
}

export function CrosswordPlayer({ payload, onFinish }: Props) {
  const clues = payload.clues;
  const [values, setValues] = useState<string[][]>(() => clues.map(c => Array(c.answer.length).fill("")));
  const [status, setStatus] = useState<(null | "correct" | "wrong")[]>(() => clues.map(() => null));
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    // focus first cell of first clue
    inputs.current[`0-0`]?.focus();
  }, []);

  function key(c: number, l: number) { return `${c}-${l}`; }

  function setLetter(clueIdx: number, letterIdx: number, ch: string) {
    const val = ch.toUpperCase().replace(/[^A-Z]/g, "");
    setValues(prev => {
      const copy = prev.map(r => r.slice());
      copy[clueIdx][letterIdx] = val.slice(-1);
      return copy;
    });
    if (val) {
      // auto-advance
      const nextL = letterIdx + 1;
      if (nextL < clues[clueIdx].answer.length) {
        inputs.current[key(clueIdx, nextL)]?.focus();
      }
    }
  }

  function handleKeyDown(clueIdx: number, letterIdx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !values[clueIdx][letterIdx] && letterIdx > 0) {
      inputs.current[key(clueIdx, letterIdx - 1)]?.focus();
    }
    if (e.key === "ArrowRight" && letterIdx + 1 < clues[clueIdx].answer.length) {
      inputs.current[key(clueIdx, letterIdx + 1)]?.focus();
    }
    if (e.key === "ArrowLeft" && letterIdx > 0) {
      inputs.current[key(clueIdx, letterIdx - 1)]?.focus();
    }
  }

  function checkOne(clueIdx: number) {
    const guess = values[clueIdx].join("");
    const answer = clues[clueIdx].answer.toUpperCase();
    setStatus(prev => {
      const copy = prev.slice();
      copy[clueIdx] = guess === answer ? "correct" : "wrong";
      return copy;
    });
  }

  function reveal(clueIdx: number) {
    setValues(prev => {
      const copy = prev.map(r => r.slice());
      copy[clueIdx] = clues[clueIdx].answer.toUpperCase().split("");
      return copy;
    });
    setStatus(prev => {
      const copy = prev.slice();
      copy[clueIdx] = "wrong"; // revealed doesn't count as correct
      return copy;
    });
  }

  function submit() {
    const finalStatus = clues.map((c, i) => values[i].join("") === c.answer.toUpperCase() ? "correct" as const : "wrong" as const);
    setStatus(finalStatus);
    const correctCount = finalStatus.filter(s => s === "correct").length;
    setTimeout(() => onFinish(correctCount, clues.length), 400);
  }

  const answeredCount = useMemo(() => status.filter(s => s !== null).length, [status]);

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-muted-foreground">
        <span className="text-foreground font-black">{answeredCount}</span> / {clues.length} checked
      </div>

      <div className="grid gap-3">
        {clues.map((c, ci) => {
          const s = status[ci];
          return (
            <div
              key={c.id}
              className={[
                "rounded-2xl border bg-card shadow-sm p-4 md:p-5 transition-all",
                activeIdx === ci ? "ring-2 ring-primary/40" : "",
                s === "correct" ? "border-emerald-400 bg-emerald-50/60" : "",
                s === "wrong" ? "border-red-300 bg-red-50/40" : "",
              ].join(" ")}
              onClick={() => setActiveIdx(ci)}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-widest text-primary">Clue {ci + 1}</div>
                  <div className="font-semibold">{c.clue}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); checkOne(ci); }}
                    className="inline-flex items-center gap-1 rounded-lg border bg-card px-2.5 py-1 text-xs font-semibold hover:bg-secondary"
                  >
                    <Check className="h-3.5 w-3.5" /> Check
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); reveal(ci); }}
                    className="inline-flex items-center gap-1 rounded-lg border bg-card px-2.5 py-1 text-xs font-semibold hover:bg-secondary"
                  >
                    <Eye className="h-3.5 w-3.5" /> Reveal
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.answer.split("").map((_, li) => (
                  <input
                    key={li}
                    ref={(el) => { inputs.current[key(ci, li)] = el; }}
                    type="text"
                    maxLength={1}
                    value={values[ci][li]}
                    onChange={(e) => setLetter(ci, li, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(ci, li, e)}
                    onFocus={() => setActiveIdx(ci)}
                    className={[
                      "h-10 w-9 md:h-11 md:w-10 text-center rounded-md border-2 bg-white text-lg font-black uppercase focus:outline-none focus:ring-2 focus:ring-ring",
                      s === "correct" ? "border-emerald-400" :
                        s === "wrong" ? "border-red-300" : "border-input",
                    ].join(" ")}
                    aria-label={`Clue ${ci + 1} letter ${li + 1}`}
                  />
                ))}
                {s === "correct" && (
                  <span className="ml-2 inline-flex items-center gap-1 text-emerald-700 text-xs font-bold"><Check className="h-4 w-4" /> Nailed it</span>
                )}
                {s === "wrong" && (
                  <span className="ml-2 inline-flex items-center gap-1 text-red-700 text-xs font-bold"><X className="h-4 w-4" /> Not yet</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-5 py-3 shadow hover:scale-[1.02] transition-transform"
        >
          <Check className="h-4 w-4" /> Submit crossword
        </button>
      </div>
    </div>
  );
}
