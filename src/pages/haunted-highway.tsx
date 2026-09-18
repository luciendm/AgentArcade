import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ghost, Sparkles, Flame, Trophy, Star, Zap, Wand2, Moon, Sun,
  BookOpen, Gauge, Timer, Puzzle, ArrowRight,
} from "lucide-react";
import {
  useAgent, useMissions, levelProgress, getGameType,
  type Mission, type GameType,
} from "@/lib/arcade-data";

/* ============================================================
   🎃 ERScapades: Haunted Highway (Halloween — light)
   Corporate-appropriate spooky-cute version on a hazy ghost-
   gray background with readable ink text and colored buttons.
   ============================================================ */

type HalloweenMission = {
  id: string;
  spookyTitle: string;
  pun: string;
  baseMissionId: string;
  gameType: GameType;
  emoji: string;
  chip: "orange" | "violet" | "slime";
  gradient: string;
};

const HALLOWEEN_MISSIONS: HalloweenMission[] = [
  {
    id: "hh-1",
    spookyTitle: "Ghouliath: The Member Who Wouldn't Hang Up",
    pun: "Talk them down before the candle burns out.",
    baseMissionId: "m12",
    gameType: "escalation",
    emoji: "🕯️",
    chip: "orange",
    gradient: "hh-card-orange",
  },
  {
    id: "hh-2",
    spookyTitle: "Pumpkin Scramble",
    pun: "Un-carve these spooky ERS terms before the pumpkin turns to pie.",
    baseMissionId: "m9",
    gameType: "scramble",
    emoji: "🎃",
    chip: "orange",
    gradient: "hh-card-orange",
  },
  {
    id: "hh-3",
    spookyTitle: "Ghost Tone Detector",
    pun: "What is the member really saying — boo-hoo or boo-yeah?",
    baseMissionId: "m10",
    gameType: "tone",
    emoji: "👻",
    chip: "violet",
    gradient: "hh-card-violet",
  },
  {
    id: "hh-4",
    spookyTitle: "Bat-Out-of-Heck Speed Round",
    pun: "Rapid-fire ERS trivia — don't get spooked, get streaks.",
    baseMissionId: "m11",
    gameType: "speed",
    emoji: "🦇",
    chip: "violet",
    gradient: "hh-card-violet",
  },
  {
    id: "hh-5",
    spookyTitle: "Cobweb Crossword",
    pun: "Dust off the terminology. Fang-tastic for coffee breaks.",
    baseMissionId: "m13",
    gameType: "crossword",
    emoji: "🕸️",
    chip: "slime",
    gradient: "hh-card-violet",
  },
  {
    id: "hh-6",
    spookyTitle: "Trick-or-Treat Empathy",
    pun: "Sort responses: treat 🍬 for the member — or trick 👻?",
    baseMissionId: "m1",
    gameType: "quiz",
    emoji: "🍬",
    chip: "orange",
    gradient: "hh-card-orange",
  },
  {
    id: "hh-7",
    spookyTitle: "Jack-o'-Lantern Match: De-escalation",
    pun: "Match the member's mood to the right glowing response.",
    baseMissionId: "m2",
    gameType: "quiz",
    emoji: "🎃",
    chip: "orange",
    gradient: "hh-card-orange",
  },
  {
    id: "hh-8",
    spookyTitle: "Cauldron of Compliance",
    pun: "Stir in the right disclosures — no PII in the potion, please.",
    baseMissionId: "m4",
    gameType: "quiz",
    emoji: "🧪",
    chip: "slime",
    gradient: "hh-card-violet",
  },
];

const PUNS = [
  "Our members deserve fang-tastic service.",
  "Don't ghost the call queue.",
  "Empathy is our secret potion.",
  "Every truck ETA is a boo-tiful promise.",
  "Compliance? Wickedly important.",
  "When in doubt, listen — the answer is often lurking in plain sight.",
  "Un-boo-lievable service starts with one warm hello.",
];

const HALLOWEEN_BADGES = [
  { id: "hb1", name: "Spirit of Service",  emoji: "👻", desc: "Complete 3 haunted missions.",     unlocked: true },
  { id: "hb2", name: "Ghoul Whisperer",    emoji: "🎃", desc: "Ace an Escalation Meter mission.",  unlocked: true },
  { id: "hb3", name: "Candle Keeper",      emoji: "🕯️", desc: "Finish escalation in the green.",    unlocked: false, progress: 0.5 },
  { id: "hb4", name: "Web Master",         emoji: "🕸️", desc: "Solve the Cobweb Crossword.",      unlocked: false, progress: 0.7 },
  { id: "hb5", name: "Tow-or-Treat Champ", emoji: "🍬", desc: "7-day Fright Shift streak.",       unlocked: false, progress: 0.4 },
  { id: "hb6", name: "Pumpkin Prodigy",    emoji: "🎃", desc: "Perfect score on a haunted mission.", unlocked: false, progress: 0.2 },
];

export default function HauntedHighwayPage() {
  const agent = useAgent();
  const missions = useMissions();
  const lp = levelProgress(agent.totalXp);

  const [night, setNight] = useState<boolean>(false);
  const [, setPunIndex] = useState<number>(0);

  useEffect(() => {
    const t = setInterval(() => setPunIndex((i) => (i + 1) % PUNS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const featured = HALLOWEEN_MISSIONS[0];

  const enriched = useMemo(() => {
    return HALLOWEEN_MISSIONS.map((hm) => {
      const base = missions.find((m) => m.id === hm.baseMissionId);
      return { hm, base };
    });
  }, [missions]);

  const spiritPct = Math.round(lp.pct * 100);

  return (
    <div
      className={[
        "halloween",
        night ? "hh-midnight" : "hh-dusk",
        "relative rounded-3xl overflow-hidden -m-2 p-4 md:p-6 min-h-[80vh]",
      ].join(" ")}
    >
      {/* Ambient layers (soft) */}
      <div className="hh-stars" aria-hidden />
      <div className="hh-moon" aria-hidden />

      {/* Floating ghosts + bats */}
      <div className="hh-ghost" style={{ top: "18%", left: "6%" }} aria-hidden>👻</div>
      <div className="hh-ghost small" style={{ top: "45%", right: "10%", animationDelay: "1.4s" }} aria-hidden>👻</div>
      <div className="hh-bat" style={{ top: "8%", animationDelay: "0s" }} aria-hidden>🦇</div>
      <div className="hh-bat" style={{ top: "30%", animationDelay: "6s" }} aria-hidden>🦇</div>

      {/* Cobweb corners */}
      <WebCorner cls="hh-web" />
      <WebCorner cls="hh-web tr" />
      <WebCorner cls="hh-web bl" />
      <WebCorner cls="hh-web br" />

      {/* Ghost trail */}
      <GhostTrail />

      {/* Header */}
      <header className="relative z-10 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-black tracking-[0.25em] uppercase hh-text-orange">
            🎃 Seasonal edition
          </div>
          <h1 className="text-3xl md:text-4xl font-black leading-tight mt-1 hh-text-ink">
            Tow or Treat: Welcome to the{" "}
            <span className="hh-text-orange">Haunted</span>{" "}
            <span className="hh-text-violet">Highway</span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm hh-text-soft">
            The same trusted <span className="hh-text-orange font-bold">ERS</span>capades, dressed up for October.
            Same tracking, spookier missions, cheekier puns — corporate-approved zero-jump-scares zone.
          </p>

          {/* Pun ticker */}
          <div className="mt-2 hh-ticker-wrap w-fit">
            <div className="hh-ticker-inner">
              {PUNS.map((p) => (
                <div key={p} className="text-xs hh-text-violet italic h-[22px] font-semibold">🦇 {p}</div>
              ))}
              <div className="text-xs hh-text-violet italic h-[22px] font-semibold">🦇 {PUNS[0]}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNight((n) => !n)}
            className="hh-btn-ghost inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold"
            aria-label="Toggle dusk / midnight"
          >
            {night ? <><Sun className="h-3.5 w-3.5" /> Dusk</> : <><Moon className="h-3.5 w-3.5" /> Midnight</>}
          </button>
          <Link
            to="/"
            className="hh-btn-ghost inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold"
          >
            Back to daytime <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* KPI cards */}
      <section className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <KpiCard
          icon={<Sparkles className="h-4 w-4" />}
          label="Spirit XP"
          value={agent.totalXp.toLocaleString()}
          sub="lifetime hauntings"
        />
        <KpiCard
          icon={<Star className="h-4 w-4" />}
          label="Ghoul Level"
          value={`Level ${lp.level}`}
          sub={`${spiritPct}% into next`}
        >
          <div className="hh-spirit mt-2">
            <i style={{ width: `${spiritPct}%` }} />
          </div>
        </KpiCard>
        <KpiCard
          icon={<Flame className="h-4 w-4" />}
          label="Fright Shift Streak"
          value={`${agent.streak}d`}
          sub="candle still lit 🕯️"
        />
        <KpiCard
          icon={<Trophy className="h-4 w-4" />}
          label="Boo-tique Badges"
          value={`${HALLOWEEN_BADGES.filter((b) => b.unlocked).length}/${HALLOWEEN_BADGES.length}`}
          sub="seasonal collectibles"
        />
      </section>

      {/* Featured mission */}
      <section className="relative z-10 mt-6">
        <FeaturedCard hm={featured} />
      </section>

      {/* Mission grid */}
      <section className="relative z-10 mt-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest hh-text-orange font-black">
              The Fright Shift lineup
            </div>
            <h2 className="text-xl font-black hh-text-ink">Missions from beyond the call queue</h2>
          </div>
          <div className="hh-chip orange">
            <Puzzle className="h-3 w-3" /> {HALLOWEEN_MISSIONS.length} · mixed game types
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {enriched.map(({ hm, base }, idx) => (
            <MissionCard key={hm.id} hm={hm} base={base} index={idx} />
          ))}
        </div>
      </section>

      {/* Boo-tique badges */}
      <section className="relative z-10 mt-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest hh-text-violet font-black">The Boo-tique</div>
            <h2 className="text-xl font-black hh-text-ink">Seasonal badges</h2>
          </div>
          <div className="hh-chip violet">
            <Wand2 className="h-3 w-3" /> Collect all 6 by Nov 1
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {HALLOWEEN_BADGES.map((b, i) => (
            <div
              key={b.id}
              className="hh-card rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden animate-rise-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className={[
                  "h-14 w-14 rounded-full grid place-items-center text-3xl border shrink-0 hh-wiggle",
                  b.unlocked
                    ? "bg-orange-50 border-orange-200"
                    : "bg-slate-50 border-slate-200 opacity-70",
                ].join(" ")}
                aria-hidden
              >
                <span className={b.unlocked ? "hh-pumpkin-glow" : ""}>{b.emoji}</span>
              </div>
              <div className="min-w-0">
                <div className="font-black truncate hh-text-ink">{b.name}</div>
                <div className="text-xs hh-text-soft">{b.desc}</div>
                {!b.unlocked && (
                  <div className="hh-spirit mt-2" aria-label="Progress">
                    <i style={{ width: `${Math.round((b.progress ?? 0) * 100)}%` }} />
                  </div>
                )}
                {b.unlocked && (
                  <span className="hh-chip slime mt-2 inline-flex">Unlocked 🎉</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <footer className="relative z-10 mt-8 text-xs hh-text-soft flex items-center gap-2">
        <span className="hh-pumpkin-glow">🎃</span>
        Haunted Highway is a seasonal skin for <span className="hh-text-orange font-bold">ERS</span>capades.
        Everything you learn here counts on the main dashboard — the ghosts are cosmetic. Boo!
      </footer>
    </div>
  );
}

/* ---------------- Sub-components ---------------- */

function KpiCard({
  icon, label, value, sub, children,
}: { icon: React.ReactNode; label: string; value: string; sub: string; children?: React.ReactNode }) {
  return (
    <div className="hh-card rounded-2xl p-4 relative overflow-hidden">
      <div className="flex items-center gap-2 text-xs hh-text-soft font-bold uppercase tracking-widest">
        <span className="hh-text-orange inline-flex">{icon}</span>
        {label}
      </div>
      <div className="text-2xl md:text-3xl font-black mt-1 tracking-tight hh-text-ink">{value}</div>
      <div className="text-[11px] hh-text-soft mt-0.5">{sub}</div>
      {children}
    </div>
  );
}

function FeaturedCard({ hm }: { hm: HalloweenMission }) {
  const gt = getGameType(hm.gameType);
  return (
    <div className={`rounded-3xl p-5 md:p-6 relative overflow-hidden hh-card-orange`}>
      <div className="absolute -top-6 -right-6 text-[150px] opacity-15 select-none pointer-events-none hh-pumpkin-glow" aria-hidden>🎃</div>
      <div className="relative z-10">
        <div className="hh-chip orange">
          <Ghost className="h-3 w-3" /> Featured tonight
        </div>
        <h3 className="text-2xl md:text-3xl font-black mt-2 leading-tight hh-text-ink">
          {hm.spookyTitle}
        </h3>
        <p className="hh-text-soft mt-1 max-w-2xl text-sm">{hm.pun}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="hh-chip">
            <GameIcon type={hm.gameType} /> {gt.label}
          </span>
          <span className="hh-chip violet">+260 Spirit XP possible</span>
          <span className="hh-chip slime">Difficulty: Ghouliath</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to={`/missions/${hm.baseMissionId}`}
            className="hh-btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold"
          >
            <Zap className="h-4 w-4" /> Play the featured haunt
          </Link>
          <Link
            to="/missions"
            className="hh-btn-ghost inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold"
          >
            <BookOpen className="h-4 w-4" /> Browse all missions
          </Link>
        </div>
      </div>
    </div>
  );
}

function MissionCard({
  hm, base, index,
}: { hm: HalloweenMission; base: Mission | undefined; index: number }) {
  const gt = getGameType(hm.gameType);
  const disabled = !base;
  return (
    <div
      className={[
        "rounded-2xl p-4 relative overflow-hidden card-hover animate-rise-in",
        hm.gradient,
      ].join(" ")}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="text-4xl leading-none hh-bob" aria-hidden>{hm.emoji}</div>
          <span className={`hh-chip ${hm.chip}`}>
            <GameIcon type={hm.gameType} /> {gt.short}
          </span>
        </div>
        <h3 className="text-lg font-black mt-2 leading-snug hh-text-ink">{hm.spookyTitle}</h3>
        <p className="text-xs hh-text-soft mt-1">{hm.pun}</p>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          {base && (
            <>
              <span className="hh-chip">{base.durationMin} min</span>
              <span className="hh-chip orange">+{base.xpReward} XP</span>
              <span className="hh-chip violet">Level {base.difficulty}</span>
            </>
          )}
        </div>

        <div className="mt-4">
          {disabled ? (
            <button
              type="button"
              disabled
              className="hh-btn-ghost inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold opacity-60"
            >
              Coming soon
            </button>
          ) : (
            <Link
              to={`/missions/${hm.baseMissionId}`}
              className={[
                "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold",
                hm.chip === "violet" ? "hh-btn-violet" : "hh-btn-primary",
              ].join(" ")}
            >
              Enter the haunt <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function GameIcon({ type }: { type: GameType }) {
  switch (type) {
    case "scramble":   return <BookOpen className="h-3 w-3" />;
    case "tone":       return <Ghost className="h-3 w-3" />;
    case "speed":      return <Timer className="h-3 w-3" />;
    case "escalation": return <Gauge className="h-3 w-3" />;
    case "crossword":  return <Puzzle className="h-3 w-3" />;
    case "quiz":
    default:           return <Sparkles className="h-3 w-3" />;
  }
}

function WebCorner({ cls }: { cls: string }) {
  return (
    <svg className={cls} viewBox="0 0 100 100" aria-hidden>
      <g stroke="rgba(74,28,138,0.55)" strokeWidth="0.8" fill="none">
        <path d="M0 0 L100 100" />
        <path d="M0 0 L80 100" />
        <path d="M0 0 L60 100" />
        <path d="M0 0 L40 100" />
        <path d="M0 0 L100 80" />
        <path d="M0 0 L100 60" />
        <path d="M0 0 L100 40" />
        <path d="M0 0 L100 20" />
        <path d="M0 0 L20 100" />
        <path d="M0 0 Q40 20 80 40" />
        <path d="M0 0 Q30 30 60 60" />
        <path d="M0 0 Q20 40 40 80" />
      </g>
    </svg>
  );
}

/* ---------------- Ghost trail (cursor follower) ---------------- */
function GhostTrail() {
  const ref = useRef<HTMLDivElement | null>(null);
  const trailRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const targetRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    let raf = 0;
    const tick = () => {
      trailRef.current.x += (targetRef.current.x - trailRef.current.x) * 0.15;
      trailRef.current.y += (targetRef.current.y - trailRef.current.y) * 0.15;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${trailRef.current.x - 12}px, ${trailRef.current.y - 12}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="hh-trail"
      style={{ opacity: visible ? 0.6 : 0 }}
      aria-hidden
    >
      👻
    </div>
  );
}
