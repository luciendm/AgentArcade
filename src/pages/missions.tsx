import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Lock, Zap, Clock, Play } from "lucide-react";
import { PageHeader } from "@/components/arcade/PageHeader";
import { Shimmer } from "@/components/arcade/Shimmer";
import {
  useMissions, useProgress, useSimulatedLoad,
  CATEGORIES, GAME_TYPES, getCategory, getGameType,
  type Category, type GameType, type Mission,
} from "@/lib/arcade-data";

type CatFilter = "all" | Category;
type GameFilter = "all" | GameType;

export default function MissionsPage() {
  const missions = useMissions();
  const progress = useProgress();
  const loading = useSimulatedLoad(400);
  const [catFilter, setCatFilter] = useState<CatFilter>("all");
  const [gameFilter, setGameFilter] = useState<GameFilter>("all");

  const filtered = missions.filter(m =>
    (catFilter === "all" || m.category === catFilter) &&
    (gameFilter === "all" || m.gameType === gameFilter)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Arcade"
        title="Missions"
        subtitle="Mix it up with quizzes, scrambles, tone detection, speed rounds, escalation meters, and crosswords. Every mission earns XP."
      />

      {/* Category chips */}
      <div>
        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Skill</div>
        <div className="flex flex-wrap gap-2">
          <Chip active={catFilter === "all"} onClick={() => setCatFilter("all")} label="All skills" emoji={null} />
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              active={catFilter === c.id}
              onClick={() => setCatFilter(c.id)}
              label={c.label}
              emoji={c.emoji}
            />
          ))}
        </div>
      </div>

      {/* Game type chips */}
      <div>
        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Game type</div>
        <div className="flex flex-wrap gap-2">
          <Chip active={gameFilter === "all"} onClick={() => setGameFilter("all")} label="All types" emoji={null} />
          {GAME_TYPES.map(g => (
            <Chip
              key={g.id}
              active={gameFilter === g.id}
              onClick={() => setGameFilter(g.id)}
              label={g.short}
              emoji={g.emoji}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Shimmer key={i} className="h-60" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => {
            const completed = progress.some(p => p.missionId === m.id && p.completed);
            return (
              <MissionCard key={m.id} mission={m} completed={completed} index={i} />
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
              No missions match that combo. Try a different filter!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, label, emoji }: { active: boolean; onClick: () => void; label: string; emoji: string | null }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold border transition-all",
        active
          ? "gradient-hero text-white border-transparent shadow"
          : "bg-card hover:bg-secondary",
      ].join(" ")}
    >
      {emoji && <span>{emoji}</span>} {label}
    </button>
  );
}

function MissionCard({ mission, completed, index }: { mission: Mission; completed: boolean; index: number }) {
  const cat = getCategory(mission.category);
  const gt = getGameType(mission.gameType);
  const locked = !!mission.locked;

  const Wrapper: React.ElementType = locked ? "div" : Link;
  const wrapperProps: Record<string, unknown> = locked ? {} : { to: `/missions/${mission.id}` };

  const itemCount =
    mission.payload.kind === "quiz" ? mission.payload.questions.length :
      mission.payload.kind === "scramble" ? mission.payload.words.length :
        mission.payload.kind === "tone" ? mission.payload.items.length :
          mission.payload.kind === "speed" ? mission.payload.items.length :
            mission.payload.kind === "escalation" ? mission.payload.turns.length :
              mission.payload.kind === "crossword" ? mission.payload.clues.length : 0;

  const itemLabel =
    mission.payload.kind === "scramble" ? "words" :
      mission.payload.kind === "tone" ? "clips" :
        mission.payload.kind === "speed" ? "prompts" :
          mission.payload.kind === "escalation" ? "turns" :
            mission.payload.kind === "crossword" ? "clues" : "questions";

  return (
    <Wrapper
      {...wrapperProps}
      className={[
        "group relative rounded-2xl border bg-card shadow-sm overflow-hidden card-hover animate-rise-in flex flex-col",
        locked ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
      style={{ animationDelay: `${index * 60}ms` }}
      aria-label={mission.title}
    >
      <div className={`${cat.gradient} p-4 text-white relative`}>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur">
            {cat.emoji} {cat.label}
          </span>
          <span className="text-white/90 text-xs font-bold" aria-label={`Difficulty ${mission.difficulty} of 3`}>
            {"★".repeat(mission.difficulty)}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-black leading-tight">{mission.title}</h3>
        {completed && !locked && (
          <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white grid place-items-center shadow animate-pop-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
        )}
        {locked && (
          <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/30 grid place-items-center backdrop-blur">
            <Lock className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2 py-0.5 text-[11px] font-bold">
            {gt.emoji} {gt.label}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{mission.description}</p>
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="inline-flex items-center gap-1 text-primary"><Zap className="h-3.5 w-3.5" /> +{mission.xpReward} XP</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {mission.durationMin} min</span>
          <span className="text-muted-foreground">{itemCount} {itemLabel}</span>
        </div>
        <div className="mt-auto">
          {locked ? (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Unlocks at Level 10
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
              <Play className="h-4 w-4" /> {completed ? "Play again" : "Start"}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
