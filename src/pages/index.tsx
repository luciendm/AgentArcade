import { Link } from "react-router-dom";
import { Flame, Trophy, Award, Zap, Play, Target, LifeBuoy } from "lucide-react";
import { XPRing } from "@/components/arcade/XPRing";
import { Shimmer } from "@/components/arcade/Shimmer";
import {
  useAgent, useMissions, useActivity, useBadges, useProgress,
  levelProgress, getCategory, useSimulatedLoad,
} from "@/lib/arcade-data";

export default function HomePage() {
  const agent = useAgent();
  const missions = useMissions();
  const activity = useActivity();
  const badges = useBadges();
  const progress = useProgress();
  const loading = useSimulatedLoad(500);

  const lp = levelProgress(agent.totalXp);
  const featured = missions.find(m => m.featured) ?? missions[0];
  const completedCount = progress.filter(p => p.completed).length;
  const unlockedBadges = badges.filter(b => b.unlocked).length;
  const featCat = getCategory(featured.category);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl gradient-hero text-white p-6 md:p-8 shadow-lg">
        <div className="absolute -top-10 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl animate-float-slow" />
        <div className="absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl animate-float-slow" style={{ animationDelay: "0.6s" }} />
        <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="animate-rise-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <LifeBuoy className="h-3.5 w-3.5" /> Welcome back, {agent.name.split(" ")[0]}!
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-black tracking-tight">
              Ready to get on-the-go?
            </h2>
            <p className="mt-2 text-white/90 max-w-lg">
              You're just <span className="font-bold">{lp.needed - lp.intoLevel} XP</span> away from Level {lp.level + 1}. One quick mission and you're rolling.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/missions"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-primary font-semibold px-4 py-2 shadow hover:scale-[1.02] transition-transform"
              >
                <Play className="h-4 w-4" /> Browse missions
              </Link>
              <Link
                to={`/missions/${featured.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur text-white font-semibold px-4 py-2 hover:bg-white/25 transition-colors"
              >
                <Target className="h-4 w-4" /> Today's mission
              </Link>
            </div>
          </div>
          <div className="justify-self-center md:justify-self-end animate-pop-in">
            <XPRing pct={lp.pct} label={`Level ${lp.level}`} sublabel={`${lp.intoLevel} / ${lp.needed} XP`} />
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Zap className="h-4 w-4" />} label="Total XP" value={agent.totalXp.toLocaleString()} tint="from-red-500/15 to-rose-500/10" loading={loading} />
        <StatCard icon={<Target className="h-4 w-4" />} label="Missions completed" value={String(completedCount)} tint="from-blue-600/15 to-sky-500/10" loading={loading} />
        <StatCard icon={<Award className="h-4 w-4" />} label="Badges earned" value={`${unlockedBadges}/${badges.length}`} tint="from-amber-500/15 to-yellow-500/10" loading={loading} />
        <StatCard icon={<Trophy className="h-4 w-4" />} label="Team rank" value={`#${agent.rank}`} tint="from-indigo-500/15 to-blue-500/10" loading={loading} />
      </section>

      {/* Featured mission + streak */}
      <section className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border bg-card shadow-sm overflow-hidden card-hover">
          <div className={`${featCat.gradient} p-5 text-white`}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
              <span>{featCat.emoji}</span> Today's mission · {featCat.label}
            </div>
            <h3 className="mt-1 text-2xl font-black">{featured.title}</h3>
            <p className="text-white/90 mt-1 max-w-xl">{featured.description}</p>
          </div>
          <div className="p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold"><Zap className="h-4 w-4 text-primary" /> +{featured.xpReward} XP</span>
              <span className="text-muted-foreground">⏱ {featured.durationMin} min</span>
              <span className="text-muted-foreground">{"⭐".repeat(featured.difficulty)}</span>
            </div>
            <Link
              to={`/missions/${featured.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2 shadow hover:scale-[1.02] transition-transform"
            >
              <Play className="h-4 w-4" /> Start mission
            </Link>
          </div>
        </div>

        {/* Streak card */}
        <div className="rounded-2xl border bg-card shadow-sm p-5 card-hover">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Learning streak</div>
          <div className="mt-2 flex items-end gap-3">
            <div className="text-6xl leading-none animate-flame"><Flame className="h-14 w-14 text-orange-500 fill-orange-400" /></div>
            <div>
              <div className="text-4xl font-black tracking-tight">{agent.streak}</div>
              <div className="text-sm text-muted-foreground">days in a row</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`h-6 rounded-md ${i < agent.streak ? "gradient-hero" : "bg-muted"}`}
                title={i < agent.streak ? "Learned" : "Missed"}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Keep the truck rolling — come back tomorrow to hit day {agent.streak + 1}!</p>
        </div>
      </section>

      {/* Activity */}
      <section className="rounded-2xl border bg-card shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold tracking-tight">Recent activity</h3>
          <Link to="/profile" className="text-xs font-semibold text-primary hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} className="h-14" />)}
          </div>
        ) : (
          <ul className="space-y-2">
            {activity.slice(0, 6).map((a, i) => (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-xl border bg-background/60 p-3 animate-rise-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="h-10 w-10 rounded-lg bg-secondary grid place-items-center text-xl">{a.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{a.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.detail}</div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{a.when}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon, label, value, tint, loading,
}: { icon: React.ReactNode; label: string; value: string; tint: string; loading: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-card p-4 card-hover bg-gradient-to-br ${tint}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      {loading ? (
        <Shimmer className="h-8 mt-2 w-24" />
      ) : (
        <div className="mt-1 text-3xl font-black tracking-tight animate-pop-in">{value}</div>
      )}
    </div>
  );
}
