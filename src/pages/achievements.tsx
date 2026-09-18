import { useMemo, useState } from "react";
import { Lock, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/arcade/PageHeader";
import { Shimmer } from "@/components/arcade/Shimmer";
import { useBadges, useSimulatedLoad } from "@/lib/arcade-data";

type Tab = "all" | "unlocked" | "locked";

export default function AchievementsPage() {
  const badges = useBadges();
  const loading = useSimulatedLoad(400);
  const [tab, setTab] = useState<Tab>("all");

  const unlocked = badges.filter(b => b.unlocked).length;
  const filtered = useMemo(() => {
    if (tab === "unlocked") return badges.filter(b => b.unlocked);
    if (tab === "locked") return badges.filter(b => !b.unlocked);
    return badges;
  }, [badges, tab]);

  const pct = badges.length > 0 ? unlocked / badges.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Trophy case"
        title="Achievements"
        subtitle="Collect badges by completing missions, keeping streaks, and mastering categories."
      />

      {/* Summary bar */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Collection</div>
            <div className="text-2xl font-black tracking-tight">
              {unlocked} <span className="text-muted-foreground text-lg font-bold">/ {badges.length} badges</span>
            </div>
          </div>
          <div className="flex gap-1 rounded-full bg-secondary p-1">
            {((["all", "unlocked", "locked"] as Tab[])).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={[
                  "px-3 py-1.5 rounded-full text-sm font-semibold transition-colors capitalize",
                  tab === t ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 h-3 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full gradient-hero transition-[width] duration-700"
            style={{ width: `${Math.round(pct * 100)}%` }}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Shimmer key={i} className="h-52" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((b, i) => (
            <div
              key={b.id}
              className={[
                "relative rounded-2xl border bg-card p-4 shadow-sm card-hover animate-rise-in flex flex-col items-center text-center",
                b.unlocked ? "badge-glow" : "",
              ].join(" ")}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div
                className={[
                  "h-20 w-20 rounded-full grid place-items-center text-4xl shadow-inner",
                  b.unlocked
                    ? "gradient-hero text-white"
                    : "bg-muted text-muted-foreground grayscale",
                ].join(" ")}
              >
                {b.emoji}
              </div>
              <div className="mt-3 font-bold">{b.name}</div>
              <div className="text-xs text-muted-foreground mt-1 min-h-[2.5rem]">{b.description}</div>
              {b.unlocked ? (
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">
                  <Sparkles className="h-3 w-3" /> Unlocked {b.unlockedAt}
                </div>
              ) : (
                <div className="mt-2 w-full">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                    <Lock className="h-3 w-3" /> Locked
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full gradient-hero"
                      style={{ width: `${Math.round((b.progress ?? 0) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">{Math.round((b.progress ?? 0) * 100)}% to unlock</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
