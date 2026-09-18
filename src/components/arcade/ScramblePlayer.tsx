import { useEffect, useMemo, useRef, useState } from "react";
import { Check, RotateCcw, Sparkles, Timer, X } from "lucide-react";
import type { ScramblePayload } from "@/lib/arcade-data";

function scramble(word: string): string {
  const letters = word.split("");
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const scrambled = letters.join("");
  return scrambled === word ? scramble(word) : scrambled;
}

interface Props {
  payload: ScramblePayload;
  onFinish: (correctCount: number, total: number) => void;
}

export function ScramblePlayer({ payload, onFinish }: Props) {
  const total = payload.words.length;
  const [idx, setIdx] = useState(0);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [correct, setCorrect] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(payload.seconds);
  const [scrambledMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    payload.words.forEach(w => { map[w.id] = scramble(w.word); });
    return map;
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const finishedRef = useRef(false);

  const current = payload.words[idx];

  useEffect(() => {
    if (finishedRef.current) return;
    const t = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(t);
          finishedRef.current = true;
          setTimeout(() => onFinish(correct, total), 200);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { inputRef.current?.focus(); }, [idx]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!current || feedback) return;
    const isRight = guess.trim().toUpperCase() === current.word.toUpperCase();
    setFeedback(isRight ? "correct" : "wrong");
    if (isRight) setCorrect(c => c + 1);
    setTimeout(() => {
      setFeedback(null);
      setGuess("");
      if (idx + 1 >= total) {
        finishedRef.current = true;
        onFinish(isRight ? correct + 1 : correct, total);
      } else {
        setIdx(i => i + 1);
      }
    }, 900);
  }

  function handleSkip() {
    if (!current || feedback) return;
    if (idx + 1 >= total) {
      finishedRef.current = true;
      onFinish(correct, total);
    } else {
      setIdx(i => i + 1);
      setGuess("");
    }
  }

  const pct = ((idx + (feedback ? 1 : 0)) / total) * 100;
  const timePct = (secondsLeft / payload.seconds) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm font-semibold text-muted-foreground">
          Word <span className="text-foreground font-black">{Math.min(idx + 1, total)}</span> / {total}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-bold">
          <Timer className="h-4 w-4" /> {secondsLeft}s
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full gradient-hero transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-amber-400 transition-[width] duration-1000" style={{ width: `${timePct}%` }} />
      </div>

      {current && (
        <div
          key={current.id}
          className={[
            "rounded-2xl border bg-card shadow-sm p-6 animate-rise-in",
            feedback === "wrong" ? "animate-shake" : "",
            feedback === "correct" ? "animate-correct" : "",
          ].join(" ")}
        >
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Unscramble</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {scrambledMap[current.id].split("").map((ch, i) => (
              <span
                key={i}
                className="h-12 w-10 md:h-14 md:w-12 grid place-items-center rounded-xl bg-gradient-to-b from-primary to-primary/80 text-primary-foreground text-2xl md:text-3xl font-black shadow-md animate-pop-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {ch}
              </span>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground italic">Hint: {current.hint}</div>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-2">
            <input
              ref={inputRef}
              type="text"
              value={guess}
              onChange={e => setGuess(e.target.value)}
              disabled={!!feedback}
              placeholder="Type your answer"
              className="flex-1 rounded-xl border bg-background px-4 py-3 text-lg font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!!feedback || !guess.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-5 py-3 shadow disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> Submit
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={!!feedback}
              className="inline-flex items-center justify-center gap-2 rounded-xl border bg-card px-4 py-3 font-semibold hover:bg-secondary disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" /> Skip
            </button>
          </form>

          {feedback && (
            <div className={[
              "mt-4 rounded-xl px-4 py-3 text-sm font-medium animate-rise-in",
              feedback === "correct" ? "bg-emerald-50 text-emerald-900 border border-emerald-200" :
                "bg-red-50 text-red-900 border border-red-200",
            ].join(" ")}>
              {feedback === "correct" ? (
                <div className="flex items-center gap-2 font-bold"><Sparkles className="h-4 w-4" /> Nailed it! It was {current.word}.</div>
              ) : (
                <div className="flex items-center gap-2 font-bold"><X className="h-4 w-4" /> Close! The word was {current.word}.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
