import { useMemo, useState } from "react";
import { Flame, Trophy, Crown, Medal } from "lucide-react";
import { PageHeader } from "@/components/arcade/PageHeader";
import { Shimmer } from "@/components/arcade/Shimmer";
import { useLeaderboard, useSimulatedLoad } from "@/lib/arcade-data";

type Range = "week" | "month" | "all";

export default function LeaderboardPage() {
  const entries = useLeaderboard();
  const loading = useSimulatedLoad(400);
  const [range, setRange] = useState<Range>("week");

  const sorted = useMemo(() => {
    const key = range === "week" ? "weekXp" : range === "month" ? "monthXp" : "allTimeXp";
    return [...entries].sort((a, b) => (b[key] as number) - (a[key] as number));
  }, [entries, range]);

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const maxXp = Math.max(...sorted.map(e => (range === "week" ? e.weekXp : range === "month" ? e.monthXp : e.allTimeXp)));

  const rangeLabel = range === "week" ? "XP this week" : range === "month" ? "XP this month" : "All-time XP";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Long Beach ERS — Team Bowen"
        title="Leaderboard"
        subtitle="Friendly competition. Climb the ranks by completing missions and keeping streaks."
        right={
          <div className="flex gap-1 rounded-full bg-secondary p-1">
            {((["week", "month", "all"] as Range[]) ).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={[
                  "px-3 py-1.5 rounded-full text-sm font-semibold transition-colors",
                  range === r ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {r === "week" ? "This week" : r === "month" ? "This month" : "All time"}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <>
          <Shimmer className="h-64" />
          <Shimmer className="h-72" />
        </>
      ) : (
        <>
          {/* Podium */}
          <div className="grid grid-cols-3 gap-3 items-end">
            <PodiumSlot entry={top3[1]} rank={2} height="h-40" delay={100} rangeLabel={rangeLabel} rangeKey={range} />
            <PodiumSlot entry={top3[0]} rank={1} height="h-52" delay={0} rangeLabel={rangeLabel} rangeKey={range} />
            <PodiumSlot entry={top3[2]} rank={3} height="h-32" delay={200} rangeLabel={rangeLabel} rangeKey={range} />
          </div>

          {/* Rest */}
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="font-bold">Rank 4 and below</div>
              <div className="text-xs text-muted-foreground">{rangeLabel}</div>
            </div>
            <ul>
              {rest.map((e, i) => {
                const xp = range === "week" ? e.weekXp : range === "month" ? e.monthXp : e.allTimeXp;
                const rank = i + 4;
                return (
                  <li
                    key={e.id}
                    className={[
                      "grid grid-cols-[40px_44px_1fr_auto_140px] items-center gap-3 px-4 py-3 border-b last:border-b-0 animate-rise-in",
                      i % 2 === 0 ? "bg-background/40" : "",
                      e.isCurrentUser ? "border-l-4 border-l-primary bg-primary/5" : "",
                    ].join(" ")}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="font-black text-muted-foreground">#{rank}</div>
                    <div className="h-10 w-10 rounded-full bg-secondary grid place-items-center text-xl">{e.avatar}</div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {e.name}
                        {e.isCurrentUser && <span className="ml-2 text-[10px] font-bold text-primary">YOU</span>}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="inline-flex items-center gap-1"><Trophy className="h-3 w-3" /> Level {e.level}</span>
                        <span className="inline-flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" /> {e.streak}d</span>
                      </div>
                    </div>
                    <div className="font-bold text-sm">{xp.toLocaleString()} XP</div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full gradient-hero"
                        style={{ width: `${Math.round((xp / maxXp) * 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function PodiumSlot({
  entry, rank, height, delay, rangeKey, rangeLabel,
}: {
  entry: any; rank: 1 | 2 | 3; height: string; delay: number;
  rangeKey: Range; rangeLabel: string;
}) {
  if (!entry) return <div />;
  const xp = rangeKey === "week" ? entry.weekXp : rangeKey === "month" ? entry.monthXp : entry.allTimeXp;
  const styles = {
    1: { bg: "from-amber-300 to-yellow-500", icon: <Crown className="h-5 w-5" />, label: "1st" },
    2: { bg: "from-slate-200 to-slate-400", icon: <Medal className="h-5 w-5" />, label: "2nd" },
    3: { bg: "from-orange-300 to-amber-600", icon: <Medal className="h-5 w-5" />, label: "3rd" },
  }[rank];

  return (
    <div className="flex flex-col items-center animate-rise-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex flex-col items-center gap-1">
        <div className={[
          "h-16 w-16 rounded-full grid place-items-center text-3xl border-4 bg-card shadow-lg",
          entry.isCurrentUser ? "border-primary" : "border-white",
        ].join(" ")}>
          {entry.avatar}
        </div>
        <div className="text-sm font-bold text-center max-w-[120px] truncate">{entry.name}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Flame className="h-3 w-3 text-orange-500" /> {entry.streak}d
        </div>
      </div>
      <div className={`w-full mt-3 rounded-t-2xl bg-gradient-to-b ${styles.bg} ${height} shadow relative flex flex-col items-center justify-start p-3 text-white`}>
        <div className="inline-flex items-center gap-1 rounded-full bg-white/25 backdrop-blur px-2 py-0.5 text-[11px] font-bold">
          {styles.icon} {styles.label}
        </div>
        <div className="mt-2 text-2xl font-black leading-none drop-shadow">{xp.toLocaleString()}</div>
        <div className="text-[10px] uppercase tracking-widest opacity-90">{rangeLabel}</div>
      </div>
    </div>
  );
}
