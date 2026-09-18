import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Zap, Sparkles, Trophy, RotateCcw, Play, Check, X } from "lucide-react";
import { PageHeader } from "@/components/arcade/PageHeader";
import { Confetti } from "@/components/arcade/Confetti";
import { ScramblePlayer } from "@/components/arcade/ScramblePlayer";
import { TonePlayer } from "@/components/arcade/TonePlayer";
import { SpeedPlayer } from "@/components/arcade/SpeedPlayer";
import { EscalationPlayer } from "@/components/arcade/EscalationPlayer";
import { CrosswordPlayer } from "@/components/arcade/CrosswordPlayer";
import {
  getCategory, getGameType, useCompleteMission, useMission,
  type Mission,
} from "@/lib/arcade-data";

type Phase = "playing" | "summary";

export default function MissionPlayPage() {
  const { missionId } = useParams();
  const mission = useMission(missionId);
  const navigate = useNavigate();
  const complete = useCompleteMission();

  const [phase, setPhase] = useState<Phase>("playing");
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [runId, setRunId] = useState(0);
  const [completedAt, setCompletedAt] = useState(0);

  const cat = mission ? getCategory(mission.category) : null;
  const gt = mission ? getGameType(mission.gameType) : null;

  const accuracy = useMemo(() => (totalCount > 0 ? correctCount / totalCount : 0), [correctCount, totalCount]);
  const earnedXp = useMemo(() => {
    if (!mission) return 0;
    return Math.round(mission.xpReward * (0.5 + 0.5 * accuracy));
  }, [mission, accuracy]);

  if (!mission) {
    return (
      <div className="space-y-4">
        <PageHeader title="Mission not found" subtitle="That mission doesn’t exist or has been retired." />
        <button
          type="button"
          onClick={() => navigate("/missions")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to missions
        </button>
      </div>
    );
  }

  function handleFinish(correct: number, total: number) {
    if (!mission) return;
    setCorrectCount(correct);
    setTotalCount(total);
    const xp = Math.round(mission.xpReward * (0.5 + 0.5 * (total > 0 ? correct / total : 0)));
    complete(mission.id, correct, total, xp);
    setCompletedAt(Date.now());
    setPhase("summary");
  }

  function handlePlayAgain() {
    setPhase("playing");
    setCorrectCount(0);
    setTotalCount(0);
    setRunId(r => r + 1);
  }

  function handleBack() {
    navigate("/missions");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-sm font-semibold hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Missions
        </button>
        <div className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{gt?.emoji} {gt?.short}</span>
        </div>
      </div>

      {/* Mission banner */}
      <div className={`rounded-2xl ${cat?.gradient} text-white p-5 shadow-md relative overflow-hidden`}>
        <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="text-xs font-semibold uppercase tracking-widest flex flex-wrap gap-x-2">
          <span>{cat?.emoji} {cat?.label}</span>
          <span>·</span>
          <span>{gt?.emoji} {gt?.label}</span>
          <span>·</span>
          <span>+{mission.xpReward} XP possible</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black mt-1">{mission.title}</h1>
        <p className="text-white/85 text-sm mt-1 max-w-2xl">{mission.description}</p>
      </div>

      {phase === "playing" && (
        <div key={`${mission.id}-${runId}`}>
          <GamePlayer mission={mission} onFinish={handleFinish} />
        </div>
      )}

      {phase === "summary" && (
        <Summary
          key={completedAt}
          missionTitle={mission.title}
          xp={earnedXp}
          accuracy={accuracy}
          correct={correctCount}
          total={totalCount}
          onPlayAgain={handlePlayAgain}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

function GamePlayer({ mission, onFinish }: { mission: Mission; onFinish: (correct: number, total: number) => void }) {
  const payload = mission.payload;
  switch (payload.kind) {
    case "scramble":
      return <ScramblePlayer payload={payload} onFinish={onFinish} />;
    case "tone":
      return <TonePlayer payload={payload} onFinish={onFinish} />;
    case "speed":
      return <SpeedPlayer payload={payload} onFinish={onFinish} />;
    case "escalation":
      return <EscalationPlayer payload={payload} onFinish={onFinish} />;
    case "crossword":
      return <CrosswordPlayer payload={payload} onFinish={onFinish} />;
    case "quiz":
    default:
      return <QuizPlayer mission={mission} onFinish={onFinish} />;
  }
}

function QuizPlayer({ mission, onFinish }: { mission: Mission; onFinish: (correct: number, total: number) => void }) {
  const total = mission.questions.length;
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const q = mission.questions[current];
  const pct = total > 0 ? (current / total) * 100 : 0;

  function handleSelect(idx: number) {
    if (locked || !q) return;
    setSelected(idx);
    setLocked(true);
    const isCorrect = idx === q.correctIndex;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setCorrectCount(c => c + 1);
  }

  function handleNext() {
    if (current + 1 >= total) {
      const finalCorrect = feedback === "correct" ? correctCount : correctCount;
      onFinish(finalCorrect, total);
      return;
    }
    setCurrent(c => c + 1);
    setSelected(null);
    setLocked(false);
    setFeedback(null);
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <span className="font-bold text-foreground">{Math.min(current + 1, total)}</span> / {total}
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full gradient-hero transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      {q && (
        <div
          key={q.id}
          className={[
            "rounded-2xl border bg-card shadow-sm p-5 md:p-6 animate-rise-in",
            feedback === "wrong" ? "animate-shake" : "",
            feedback === "correct" ? "animate-correct" : "",
          ].join(" ")}
        >
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Question {current + 1}</div>
          <h2 className="text-lg md:text-xl font-bold mt-1">{q.prompt}</h2>

          <div className="mt-5 grid gap-2">
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === q.correctIndex;
              const showState = locked;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(i)}
                  disabled={locked}
                  className={[
                    "text-left rounded-xl border px-4 py-3 font-medium transition-all",
                    !locked && "hover:border-primary hover:bg-primary/5",
                    showState && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-900",
                    showState && isSelected && !isCorrect && "border-red-500 bg-red-50 text-red-900",
                    !showState && isSelected && "border-primary bg-primary/5",
                  ].filter(Boolean).join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <span className={[
                      "h-7 w-7 rounded-full grid place-items-center text-xs font-black shrink-0",
                      showState && isCorrect ? "bg-emerald-500 text-white" :
                        showState && isSelected && !isCorrect ? "bg-red-500 text-white" :
                          "bg-secondary text-secondary-foreground",
                    ].join(" ")}>
                      {showState && isCorrect ? <Check className="h-4 w-4" /> :
                        showState && isSelected && !isCorrect ? <X className="h-4 w-4" /> :
                          String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {locked && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className={[
                "rounded-xl px-4 py-3 text-sm font-medium max-w-xl animate-rise-in",
                feedback === "correct" ? "bg-emerald-50 text-emerald-900 border border-emerald-200" :
                  "bg-red-50 text-red-900 border border-red-200",
              ].join(" ")}>
                <div className="font-bold flex items-center gap-2">
                  {feedback === "correct" ? <><Sparkles className="h-4 w-4" /> Nice!</> : <><X className="h-4 w-4" /> Not quite</>}
                </div>
                <div className="mt-1">{q.explanation}</div>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2 shadow hover:scale-[1.02] transition-transform"
              >
                {current + 1 >= total ? "Finish mission" : "Next question"} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Summary({
  missionTitle, xp, accuracy, correct, total, onPlayAgain, onBack,
}: {
  missionTitle: string; xp: number; accuracy: number; correct: number; total: number;
  onPlayAgain: () => void; onBack: () => void;
}) {
  const perfect = accuracy === 1 && total > 0;
  return (
    <>
      {perfect && <Confetti />}
      <div className="relative overflow-hidden rounded-3xl border bg-card p-6 md:p-8 shadow-lg text-center animate-pop-in">
        <div className="absolute inset-x-0 top-0 h-2 gradient-hero" />
        <div className="mt-2">
          <Trophy className={`inline-block h-14 w-14 animate-float-slow ${perfect ? "text-amber-500 fill-amber-300" : "text-primary"}`} />
        </div>
        <h2 className="mt-2 text-3xl font-black tracking-tight">Mission complete!</h2>
        <p className="text-muted-foreground mt-1">“{missionTitle}” wrapped up.</p>
        <div className="mt-6 grid grid-cols-3 gap-3 max-w-xl mx-auto">
          <SummaryStat icon={<Zap className="h-4 w-4" />} label="XP earned" value={`+${xp}`} />
          <SummaryStat icon={<Sparkles className="h-4 w-4" />} label="Score" value={`${correct}/${total || 0}`} />
          <SummaryStat icon={<Trophy className="h-4 w-4" />} label={perfect ? "Perfect!" : "Well done"} value={perfect ? "★★★" : "★★"} />
        </div>
        {perfect && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-sm font-bold animate-pop-in">
            <Sparkles className="h-4 w-4" /> Badge progress: Perfectionist
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 font-semibold hover:bg-secondary"
          >
            <RotateCcw className="h-4 w-4" /> Play again
          </button>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2 shadow hover:scale-[1.02] transition-transform"
          >
            <Play className="h-4 w-4" /> Back to missions
          </button>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2 rounded-xl bg-accent text-accent-foreground font-semibold px-4 py-2 shadow hover:scale-[1.02] transition-transform"
          >
            <Trophy className="h-4 w-4" /> Leaderboard
          </Link>
        </div>
      </div>
    </>
  );
}

function SummaryStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background/60 p-3">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1">{icon} {label}</div>
      <div className="text-2xl font-black tracking-tight mt-0.5">{value}</div>
    </div>
  );
}
