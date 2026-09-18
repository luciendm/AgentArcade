import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, TrendingUp, Flame, AlertTriangle, Download, CheckCircle2,
  ChevronDown, ChevronRight, ExternalLink, ShieldCheck, Trophy, Sparkles,
  Copy, Rocket, ListChecks, Zap, Share2, Eye, HelpCircle, PartyPopper, Printer,
} from "lucide-react";
import { PageHeader } from "@/components/arcade/PageHeader";
import { Shimmer } from "@/components/arcade/Shimmer";
import {
  useLeaderboard, useMissions, useBadges, useSimulatedLoad,
  CATEGORIES, getCategory, type Category,
} from "@/lib/arcade-data";

type Tab = "overview" | "agents" | "setup";

export default function AdminPage() {
  const entries = useLeaderboard();
  const missions = useMissions();
  const badges = useBadges();
  const loading = useSimulatedLoad(400);
  const [tab, setTab] = useState<Tab>("overview");

  const agentStats = useMemo(() => {
    return entries.map((e, i) => {
      const completed = Math.min(missions.length, Math.round((e.allTimeXp / 22000) * missions.length));
      const accuracy = Math.max(0.62, Math.min(0.99, 0.72 + (e.weekXp / 2000) * 0.2 - (i * 0.005)));
      const lastActiveDaysAgo = e.streak > 0 ? 0 : Math.min(21, i + 1);
      const atRisk = e.streak === 0 || accuracy < 0.7 || lastActiveDaysAgo > 5;
      const badgeCount = Math.max(1, Math.round((e.allTimeXp / 21400) * 8));
      return {
        ...e, completed, totalMissions: missions.length, accuracy,
        lastActiveDaysAgo, atRisk, badgeCount,
      };
    });
  }, [entries, missions.length]);

  const kpis = useMemo(() => {
    const totalAgents = agentStats.length;
    const activeThisWeek = agentStats.filter(a => a.weekXp > 0).length;
    const avgAccuracy = agentStats.reduce((s, a) => s + a.accuracy, 0) / Math.max(1, totalAgents);
    const avgCompletion = agentStats.reduce((s, a) => s + a.completed / a.totalMissions, 0) / Math.max(1, totalAgents);
    const avgStreak = agentStats.reduce((s, a) => s + a.streak, 0) / Math.max(1, totalAgents);
    const atRisk = agentStats.filter(a => a.atRisk).length;
    const badgesUnlocked = badges.filter(b => b.unlocked).length;
    return { totalAgents, activeThisWeek, avgAccuracy, avgCompletion, avgStreak, atRisk, badgesUnlocked };
  }, [agentStats, badges]);

  const categoryCompletion = useMemo(() => {
    return CATEGORIES.map(c => {
      const weight = c.id === "empathy" ? 0.78 : c.id === "deesc" ? 0.62 : c.id === "product" ? 0.7 : c.id === "compliance" ? 0.48 : 0.73;
      return { category: c.id as Category, label: c.label, gradient: c.gradient, pct: weight };
    });
  }, []);

  const exportCsv = () => {
    const rows = [
      ["Agent", "Level", "WeekXP", "AllTimeXP", "Streak", "Completed", "Total", "Accuracy", "Badges", "AtRisk"],
      ...agentStats.map(a => [
        a.name, a.level, a.weekXp, a.allTimeXp, a.streak, a.completed,
        a.totalMissions, (a.accuracy * 100).toFixed(1) + "%", a.badgeCount, a.atRisk ? "Yes" : "No",
      ]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agentarcade-team-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Coach view"
        title="Admin & Coach Dashboard"
        subtitle="Track team progress, spot at-risk agents, and celebrate wins. In production, this data comes from your SharePoint list."
        right={
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow hover:brightness-110 transition"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3 flex items-start gap-3 text-sm">
        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold">Preview mode</div>
          <div className="text-muted-foreground">
            Numbers below are simulated. Head to the <button onClick={() => setTab("setup")} className="underline font-semibold text-primary">Launch guide</button> for the full end-to-end setup: SharePoint + Power Automate + share link.
          </div>
        </div>
      </div>

      <div className="flex gap-1 rounded-full bg-secondary p-1 w-fit">
        {((["overview", "agents", "setup"] as Tab[])).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              "px-4 py-1.5 rounded-full text-sm font-semibold transition-colors capitalize",
              tab === t ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t === "setup" ? "Launch guide" : t}
          </button>
        ))}
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} className="h-24" />)}
          </div>
          <Shimmer className="h-72" />
        </>
      ) : tab === "overview" ? (
        <OverviewTab kpis={kpis} agentStats={agentStats} categoryCompletion={categoryCompletion} />
      ) : tab === "agents" ? (
        <AgentsTab agentStats={agentStats} />
      ) : (
        <SetupTab />
      )}
    </div>
  );
}

/* ---------------- Overview ---------------- */
function OverviewTab({ kpis, agentStats, categoryCompletion }: any) {
  const atRiskAgents = agentStats.filter((a: any) => a.atRisk).slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={<Users className="h-5 w-5" />} label="Team size" value={kpis.totalAgents} sub={`${kpis.activeThisWeek} active this week`} gradient="gradient-hero" />
        <KpiCard icon={<CheckCircle2 className="h-5 w-5" />} label="Avg completion" value={`${Math.round(kpis.avgCompletion * 100)}%`} sub="across all missions" gradient="gradient-listening" />
        <KpiCard icon={<TrendingUp className="h-5 w-5" />} label="Avg accuracy" value={`${Math.round(kpis.avgAccuracy * 100)}%`} sub="quiz score" gradient="gradient-product" />
        <KpiCard icon={<Flame className="h-5 w-5" />} label="Avg streak" value={`${kpis.avgStreak.toFixed(1)}d`} sub={`${kpis.atRisk} at risk`} gradient="gradient-deesc" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Team completion</div>
              <div className="font-bold text-lg">By category</div>
            </div>
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {categoryCompletion.map((c: any, idx: number) => (
              <div key={c.category} className="animate-rise-in" style={{ animationDelay: `${idx * 60}ms` }}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">{getCategory(c.category).emoji} {c.label}</span>
                  <span className="tabular-nums text-muted-foreground">{Math.round(c.pct * 100)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${c.gradient} transition-[width] duration-700`} style={{ width: `${Math.round(c.pct * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Needs a nudge</div>
              <div className="font-bold text-lg">At-risk agents</div>
            </div>
            <AlertTriangle className="h-5 w-5 text-accent" />
          </div>
          {atRiskAgents.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">🎉 Every agent is on track!</div>
          ) : (
            <ul className="space-y-2">
              {atRiskAgents.map((a: any, i: number) => (
                <li key={a.id} className="flex items-center gap-3 p-2 rounded-xl bg-accent/5 border border-accent/20 animate-rise-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="h-10 w-10 rounded-full bg-white grid place-items-center text-xl border">{a.avatar}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate">{a.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.streak === 0 ? "No active streak" : `${a.streak}d streak`} · {Math.round(a.accuracy * 100)}% accuracy
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`In production this would send ${a.name} an encouraging Teams message.`)}
                    className="text-xs font-semibold text-primary hover:underline shrink-0"
                  >
                    Send nudge
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">This week</div>
            <div className="font-bold text-lg">Top performers</div>
          </div>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {agentStats.slice(0, 3).map((a: any, i: number) => (
            <div key={a.id} className="rounded-xl border bg-gradient-to-br from-secondary to-background p-4 flex items-center gap-3 animate-pop-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="h-12 w-12 rounded-full bg-white grid place-items-center text-2xl border shadow">{a.avatar}</div>
              <div className="min-w-0">
                <div className="font-bold truncate">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.weekXp.toLocaleString()} XP · {a.badgeCount} badges</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, gradient }: any) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm relative overflow-hidden card-hover">
      <div className={`absolute -top-6 -right-6 h-20 w-20 rounded-full ${gradient} opacity-20`} />
      <div className={`inline-flex items-center justify-center h-9 w-9 rounded-lg ${gradient} text-white shadow mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

/* ---------------- Agents Tab ---------------- */
function AgentsTab({ agentStats }: any) {
  const [sortKey, setSortKey] = useState<"name" | "weekXp" | "accuracy" | "streak" | "completed">("weekXp");
  const [asc, setAsc] = useState(false);
  const [filter, setFilter] = useState<"all" | "atrisk" | "active">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = useMemo(() => {
    let list = [...agentStats];
    if (filter === "atrisk") list = list.filter(a => a.atRisk);
    if (filter === "active") list = list.filter(a => a.weekXp > 0);
    list.sort((a: any, b: any) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (typeof av === "string") return asc ? av.localeCompare(bv) : bv.localeCompare(av);
      return asc ? av - bv : bv - av;
    });
    return list;
  }, [agentStats, sortKey, asc, filter]);

  const toggleSort = (k: any) => {
    if (sortKey === k) setAsc(v => !v);
    else { setSortKey(k); setAsc(false); }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex gap-1 rounded-full bg-secondary p-1">
          {(["all", "active", "atrisk"] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={[
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                filter === f ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {f === "all" ? "All agents" : f === "active" ? "Active this week" : "⚠️ At risk"}
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground self-center">{sorted.length} agents</div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="grid grid-cols-[24px_1.6fr_0.8fr_0.9fr_0.9fr_0.9fr_0.8fr] items-center gap-2 px-4 py-3 border-b bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <div></div>
          <SortHead label="Agent" active={sortKey === "name"} asc={asc} onClick={() => toggleSort("name")} />
          <SortHead label="Week XP" active={sortKey === "weekXp"} asc={asc} onClick={() => toggleSort("weekXp")} />
          <SortHead label="Completed" active={sortKey === "completed"} asc={asc} onClick={() => toggleSort("completed")} />
          <SortHead label="Accuracy" active={sortKey === "accuracy"} asc={asc} onClick={() => toggleSort("accuracy")} />
          <SortHead label="Streak" active={sortKey === "streak"} asc={asc} onClick={() => toggleSort("streak")} />
          <div className="text-right">Status</div>
        </div>
        <ul>
          {sorted.map((a: any, i: number) => {
            const isOpen = expanded === a.id;
            return (
              <li key={a.id} className="border-b last:border-b-0">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : a.id)}
                  className={[
                    "w-full grid grid-cols-[24px_1.6fr_0.8fr_0.9fr_0.9fr_0.9fr_0.8fr] items-center gap-2 px-4 py-3 text-left hover:bg-muted/40 transition-colors animate-rise-in",
                    i % 2 === 0 ? "bg-background/40" : "",
                  ].join(" ")}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-secondary grid place-items-center text-lg shrink-0">{a.avatar}</div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{a.name}</div>
                      <div className="text-[11px] text-muted-foreground">Level {a.level} · {a.badgeCount} badges</div>
                    </div>
                  </div>
                  <div className="font-bold tabular-nums text-sm">{a.weekXp.toLocaleString()}</div>
                  <div className="text-sm tabular-nums">
                    <div>{a.completed}/{a.totalMissions}</div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                      <div className="h-full gradient-hero" style={{ width: `${(a.completed / a.totalMissions) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    <span className={a.accuracy >= 0.85 ? "text-emerald-600" : a.accuracy >= 0.7 ? "text-amber-600" : "text-destructive"}>
                      {Math.round(a.accuracy * 100)}%
                    </span>
                  </div>
                  <div className="text-sm inline-flex items-center gap-1 font-semibold">
                    <Flame className={`h-3.5 w-3.5 ${a.streak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
                    {a.streak}d
                  </div>
                  <div className="text-right">
                    {a.atRisk ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 text-accent px-2 py-0.5 text-[11px] font-bold">
                        <AlertTriangle className="h-3 w-3" /> At risk
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 px-2 py-0.5 text-[11px] font-bold">
                        <CheckCircle2 className="h-3 w-3" /> On track
                      </span>
                    )}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 bg-muted/20 border-t animate-rise-in">
                    <div className="grid sm:grid-cols-3 gap-3 mt-3">
                      <MiniStat label="All-time XP" value={a.allTimeXp.toLocaleString()} />
                      <MiniStat label="Month XP" value={a.monthXp.toLocaleString()} />
                      <MiniStat label="Last active" value={a.lastActiveDaysAgo === 0 ? "Today" : `${a.lastActiveDaysAgo}d ago`} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => alert(`Assign a coaching mission to ${a.name}`)} className="text-xs font-semibold rounded-full bg-primary text-primary-foreground px-3 py-1.5 hover:brightness-110">Assign coaching mission</button>
                      <button type="button" onClick={() => alert(`Send praise message to ${a.name} 🎉`)} className="text-xs font-semibold rounded-full bg-secondary text-secondary-foreground px-3 py-1.5 hover:bg-muted">Send praise 🎉</button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function SortHead({ label, active, asc, onClick }: any) {
  return (
    <div onClick={onClick} className={`cursor-pointer select-none ${active ? "text-primary" : ""}`}>
      {label}{active ? (asc ? " ▲" : " ▼") : ""}
    </div>
  );
}

function MiniStat({ label, value }: any) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

/* ---------------- Launch guide (SetupTab) ---------------- */

const PROGRESS_COLUMNS: [string, string, string][] = [
  ["AgentEmail", "Single line of text", "Auto-filled from the signed-in user (SSO)."],
  ["AgentName", "Single line of text", "Auto-filled from M365 profile."],
  ["MissionId", "Single line of text", "Internal ID like m1, m2…"],
  ["MissionName", "Single line of text", "Human-readable mission title."],
  ["Category", "Choice", "Empathy / De-escalation / Product / Compliance / Listening"],
  ["Score", "Number", "Correct answers count."],
  ["TotalQuestions", "Number", "Total questions in the mission."],
  ["AccuracyPct", "Number", "0–100. Used for admin analytics."],
  ["XPEarned", "Number", "XP awarded on completion."],
  ["BadgeEarned", "Single line of text", "Optional — name of badge unlocked, if any."],
  ["CompletedOn", "Date and time", "Timestamp of completion."],
];

const PROFILES_COLUMNS: [string, string, string][] = [
  ["AgentEmail", "Single line of text", "Primary key. Set as required + enforce unique."],
  ["AgentName", "Single line of text", "Display name."],
  ["Team", "Single line of text", "e.g. ‘Long Beach — Team Bowen’."],
  ["TotalXP", "Number", "Running total."],
  ["Level", "Number", "Computed from TotalXP."],
  ["CurrentStreak", "Number", "Days in a row learning."],
  ["LastActive", "Date and time", "Updated on each save."],
  ["IsCoach", "Yes/No", "Controls access to the Admin/Coach view."],
];

const FLOW_REQUEST_SCHEMA = `{
  "type": "object",
  "properties": {
    "agentEmail": { "type": "string" },
    "agentName": { "type": "string" },
    "missionId": { "type": "string" },
    "missionName": { "type": "string" },
    "category": { "type": "string" },
    "score": { "type": "integer" },
    "totalQuestions": { "type": "integer" },
    "accuracyPct": { "type": "integer" },
    "xpEarned": { "type": "integer" },
    "badgeEarned": { "type": "string" },
    "completedOn": { "type": "string" }
  },
  "required": ["agentEmail", "missionId", "xpEarned"]
}`;

function SetupTab() {
  return (
    <div className="space-y-6">
      {/* Intro hero */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="h-6 w-6 text-primary" /><Link to="/launch-guide/print" target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-bold shadow hover:brightness-110"><Printer className="h-3.5 w-3.5" /> Printable version</Link>
          <h2 className="text-2xl font-black">End-to-end launch guide</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Everything you need to take ERScapades from preview to live with real admin tracking—using only what your M365 Enterprise license already includes. No IT tickets. Estimated total time: <b>45–60 minutes</b>.
        </p>
        <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <MiniPill icon={<ListChecks className="h-3.5 w-3.5" />} label="7 steps" />
          <MiniPill icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Uses your existing SharePoint site" />
          <MiniPill icon={<Zap className="h-3.5 w-3.5" />} label="Standard Power Automate" />
          <MiniPill icon={<Share2 className="h-3.5 w-3.5" />} label="SSO via M365 sign-in" />
        </div>
      </div>

      {/* Prereqs */}
      <SetupStep step={0} title="Before you begin — prerequisites" time="~2 min" icon={<HelpCircle className="h-4 w-4" />}>
        <ul className="space-y-2 text-sm">
          <PrereqRow ok label="M365 Enterprise license (you have this)." />
          <PrereqRow ok label="An existing SharePoint site you can add lists to (you have this)." />
          <PrereqRow ok label="Permission to create Power Automate flows (default for M365 users)." />
          <PrereqRow ok label="Ability to publish/share this app link to your organization." />
          <PrereqRow warn label="Optional: a security group of coaches/admins. If you don't have one, we'll use an IsCoach flag on the Profiles list instead." />
        </ul>
        <div className="mt-3 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
          <b>Have handy:</b> your SharePoint site URL (looks like <code className="px-1 rounded bg-background">https://&lt;tenant&gt;.sharepoint.com/sites/&lt;yoursite&gt;</code>) and a list of agent emails for the initial Profiles seed.
        </div>
      </SetupStep>

      {/* Step 1: SharePoint site prep */}
      <SetupStep step={1} title="Prepare your SharePoint site" time="~5 min" icon={<ShieldCheck className="h-4 w-4 text-primary" />}>
        <ol className="list-decimal ml-5 space-y-1.5 text-sm">
          <li>Open your site: <code className="px-1 rounded bg-muted">https://&lt;tenant&gt;.sharepoint.com/sites/&lt;yoursite&gt;</code></li>
          <li>Click the gear ⚙️ (top right) → <b>Site permissions</b>. Confirm you are a <b>Site Owner</b> (or Member with contribute rights).</li>
          <li>Under <b>Site contents</b>, click <b>+ New → App</b>. This is where we'll add the two lists in steps 2 and 3.</li>
          <li>Copy your site URL to a notepad. You'll paste it later.</li>
        </ol>
        <Callout tone="tip">
          Not sure if you're an owner? You can still create lists as a Member. If “New list” is grayed out, ask your site owner (usually your manager) to grant “Edit” rights.
        </Callout>
      </SetupStep>

      {/* Step 2: Progress list */}
      <SetupStep step={2} title="Create the ERScapades Progress list" time="~10 min" icon={<ListChecks className="h-4 w-4 text-primary" />}>
        <ol className="list-decimal ml-5 space-y-1.5 text-sm">
          <li>On your SharePoint site: <b>+ New → List → Blank list</b>.</li>
          <li>Name: <CopyChip text="ERScapades Progress" /> → Create.</li>
          <li>Delete the default <b>Title</b> column? Keep it but rename it to <b>MissionName</b> (Column header → Column settings → Edit).</li>
          <li>Click <b>+ Add column</b> for each row below and set the type shown:</li>
        </ol>
        <ColumnTable rows={PROGRESS_COLUMNS} />
        <Callout tone="tip">
          For the <b>Category</b> Choice column, add exactly these five options: <em>Empathy, De-escalation, Product, Compliance, Listening</em>. Match spelling or the analytics won't group correctly.
        </Callout>
      </SetupStep>

      {/* Step 3: Profiles list */}
      <SetupStep step={3} title="Create the ERScapades Profiles list" time="~7 min" icon={<ListChecks className="h-4 w-4 text-primary" />}>
        <ol className="list-decimal ml-5 space-y-1.5 text-sm">
          <li>Repeat: <b>+ New → List → Blank list</b>.</li>
          <li>Name: <CopyChip text="ERScapades Profiles" /></li>
          <li>Rename <b>Title</b> → <b>AgentName</b>. Add the rest of these columns:</li>
        </ol>
        <ColumnTable rows={PROFILES_COLUMNS} />
        <ol className="list-decimal ml-5 space-y-1.5 text-sm mt-3" start={4}>
          <li>Add one row per starting agent (email + name + team). This seeds the app.</li>
          <li>Mark yourself (and any other coach) <b>IsCoach = Yes</b>. The app hides the Admin tab from agents where this is No.</li>
        </ol>
      </SetupStep>

      {/* Step 4: List permissions */}
      <SetupStep step={4} title="Set list permissions" time="~5 min" icon={<ShieldCheck className="h-4 w-4 text-primary" />}>
        <ol className="list-decimal ml-5 space-y-1.5 text-sm">
          <li>On <b>ERScapades Progress</b>: click the gear ⚙️ → <b>List settings</b> → <b>Permissions for this list</b>.</li>
          <li>Click <b>Stop inheriting permissions</b> (so this list has its own rules).</li>
          <li>Grant your agents' group <b>Contribute</b> (they can add rows but not edit others').</li>
          <li>Grant your coach group (or just yourself for now) <b>Full Control</b>.</li>
          <li>Repeat for <b>ERScapades Profiles</b>. Set agents to <b>Read</b> and coaches to <b>Full Control</b>.</li>
        </ol>
        <Callout tone="warn">
          Don't give agents <b>Full Control</b> — they could edit each other's XP. <b>Contribute</b> on Progress + <b>Read</b> on Profiles is the safe combo.
        </Callout>
      </SetupStep>

      {/* Step 5: Power Automate flow */}
      <SetupStep step={5} title="Build the Power Automate flow (SaveProgress)" time="~15 min" icon={<Zap className="h-4 w-4 text-primary" />}>
        <p className="text-sm text-muted-foreground mb-2">
          This flow is the pipe between ERScapades and SharePoint. The app POSTs a small JSON payload; the flow writes it to your lists. Uses only the <b>standard SharePoint connector</b> — no premium license.
        </p>
        <ol className="list-decimal ml-5 space-y-1.5 text-sm">
          <li>Go to <a className="text-primary underline" href="https://make.powerautomate.com" target="_blank" rel="noreferrer">make.powerautomate.com</a>.</li>
          <li><b>+ Create</b> → <b>Instant cloud flow</b>.</li>
          <li>Name: <CopyChip text="ERScapades — SaveProgress" /></li>
          <li>Trigger: choose <b>“When an HTTP request is received”</b>.
            <div className="text-xs text-muted-foreground mt-1">
              <b>Note:</b> this trigger is Premium in some tenants. If yours blocks it, use <b>“PowerApps V2”</b> instead — same idea, free.
            </div>
          </li>
          <li>In the trigger, click <b>Use sample payload to generate schema</b> and paste:</li>
        </ol>
        <CodeBlock code={FLOW_REQUEST_SCHEMA} language="json" />
        <ol className="list-decimal ml-5 space-y-1.5 text-sm mt-3" start={6}>
          <li>Add action: <b>SharePoint → Create item</b>.
            <ul className="list-disc ml-5 mt-1 text-muted-foreground">
              <li>Site Address: your SharePoint site URL.</li>
              <li>List Name: <b>ERScapades Progress</b>.</li>
              <li>Map each field to the matching dynamic value from the trigger (AgentEmail → agentEmail, etc.).</li>
              <li>For <b>CompletedOn</b>, use expression <code className="px-1 rounded bg-muted">utcNow()</code>.</li>
            </ul>
          </li>
          <li>Add action: <b>SharePoint → Get items</b> on <b>ERScapades Profiles</b> with filter <code className="px-1 rounded bg-muted">AgentEmail eq '@{'{'}triggerBody()?['agentEmail']{'}'}'</code>.</li>
          <li>Add action: <b>SharePoint → Update item</b> on the returned profile row.
            <ul className="list-disc ml-5 mt-1 text-muted-foreground">
              <li>TotalXP = existing TotalXP + xpEarned.</li>
              <li>Level = <code className="px-1 rounded bg-muted">div(TotalXP, 500)</code> (simple formula; the app does the exact math on read).</li>
              <li>LastActive = <code className="px-1 rounded bg-muted">utcNow()</code>.</li>
            </ul>
          </li>
          <li>Add final action: <b>Response</b> → status <b>200</b>, body <code className="px-1 rounded bg-muted">{`{"ok": true}`}</code>.</li>
          <li><b>Save</b> the flow, then open the trigger again to reveal the generated <b>HTTP POST URL</b>. Copy it — you'll paste it in step 6.</li>
        </ol>
        <Callout tone="tip">
          Test the flow directly from Power Automate’s <b>Test</b> panel with a sample payload before wiring the app. If the test creates a row in your Progress list, you're golden.
        </Callout>
      </SetupStep>

      {/* Step 6: Connect the app */}
      <SetupStep step={6} title="Connect ERScapades to SharePoint" time="~10 min" icon={<Share2 className="h-4 w-4 text-primary" />}>
        <ol className="list-decimal ml-5 space-y-1.5 text-sm">
          <li>Come back to this chat and say: <em>“Connect ERScapades to my SharePoint lists.”</em></li>
          <li>You'll be asked for three things — paste them in:
            <ul className="list-disc ml-5 mt-1 text-muted-foreground">
              <li>Your SharePoint <b>site URL</b>.</li>
              <li>The Power Automate <b>SaveProgress HTTP URL</b> from step 5.</li>
              <li>Any special <b>team</b> label you want stamped on new profiles.</li>
            </ul>
          </li>
          <li>The app replaces its in-memory store with SharePoint reads (for the leaderboard, admin dashboard, and profile) and posts to your flow on every mission completion.</li>
          <li>The signed-in M365 user's email becomes the agent identity. That's your SSO — no separate login screen needed.</li>
        </ol>
      </SetupStep>

      {/* Step 7: Share */}
      <SetupStep step={7} title="Publish & share the link" time="~3 min" icon={<Share2 className="h-4 w-4 text-primary" />}>
        <ol className="list-decimal ml-5 space-y-1.5 text-sm">
          <li>Click <b>Publish</b> (or <b>Share</b>) at the top of this builder.</li>
          <li>Choose <b>“Anyone in my organization”</b> — this enforces M365 SSO automatically.</li>
          <li>Copy the link and send it via Teams, email, or pin it in a channel.</li>
          <li>First-time users: when they open the link and complete their first mission, the flow auto-creates their Profiles row.</li>
        </ol>
        <Callout tone="success">
          🎉 <b>You're live!</b> Open the <b>Overview</b> tab of this admin view and refresh — real data will start replacing the preview numbers as agents play.
        </Callout>
      </SetupStep>

      {/* Ongoing admin */}
      <SetupStep step={8} title="How you’ll monitor (day-to-day)" time="ongoing" icon={<Eye className="h-4 w-4 text-primary" />}>
        <ul className="list-disc ml-5 space-y-1.5 text-sm">
          <li><b>This dashboard</b> — Overview + Agents tabs, updated live.</li>
          <li><b>SharePoint list views</b> — open the Progress list, click <b>All items → Group by → AgentName</b> for a quick per-agent view. Export to Excel anytime.</li>
          <li><b>Weekly digest</b> — optional: build a second Power Automate flow on a schedule (Mondays 8am) that emails the leaderboard to your team.</li>
          <li><b>CSV export</b> — the button at the top of this page pulls the current view for stakeholder reports.</li>
        </ul>
      </SetupStep>

      {/* Troubleshooting */}
      <SetupStep step={9} title="Troubleshooting" time="reference" icon={<HelpCircle className="h-4 w-4 text-primary" />}>
        <div className="space-y-3 text-sm">
          <FAQ q="The flow says the HTTP trigger is Premium." a="Swap it for the PowerApps V2 trigger — same schema, no license needed. If you use PowerApps V2, the app will call the flow through the built-in connector instead of a raw URL." />
          <FAQ q="Agents see 'Access denied' when they play." a="Their account needs Contribute on ERScapades Progress. Re-check step 4. Also make sure your agents' security group is added directly, not through nested groups." />
          <FAQ q="XP totals look wrong." a="The Update item action in step 5 might not be reading the existing TotalXP. Add a Get item action before Update to fetch the current value, then reference it in the sum." />
          <FAQ q="I want to hide the Admin tab from agents." a="The app reads IsCoach on the Profiles list. If it's No (or missing), the Admin/Coach nav item is hidden. Set it to Yes for coaches only." />
          <FAQ q="Can I add my own custom missions later?" a="Yes. Ask this chat: 'Add a new mission called <name>' and it will drop it into the app. Later, we can also drive missions from a third SharePoint list if you want zero-code editing." />
        </div>
      </SetupStep>

      {/* Permissions recap */}
      <div className="rounded-2xl border bg-gradient-to-br from-secondary to-background p-5 shadow-sm">
        <div className="font-bold mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Permissions & licensing recap</div>
        <ul className="space-y-1.5 text-sm">
          {[
            ["SharePoint site + lists", true, "Included with M365 Enterprise"],
            ["Microsoft Lists UI", true, "Included with M365 Enterprise"],
            ["Power Automate — standard connectors", true, "Included with M365 Enterprise"],
            ["Power Automate — HTTP request trigger", false, "Premium in some tenants — use PowerApps V2 as fallback"],
            ["SSO via M365 sign-in on the app link", true, "Automatic when shared org-wide"],
            ["Dataverse", false, "Requires premium license — not needed here"],
          ].map(([label, ok, note]) => (
            <li key={label as string} className="flex items-center gap-2">
              {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-accent" />}
              <span className={ok ? "font-medium" : "text-muted-foreground"}>{label}</span>
              <span className="text-xs text-muted-foreground ml-auto">{note}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Handy links */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="font-bold mb-2 flex items-center gap-2"><ExternalLink className="h-4 w-4 text-primary" /> Handy Microsoft docs</div>
        <ul className="space-y-1.5 text-sm">
          <DocLink href="https://learn.microsoft.com/en-us/sharepoint/create-a-list" label="Create a SharePoint list" />
          <DocLink href="https://support.microsoft.com/en-us/office/set-up-and-manage-list-permissions-cd6a4c2f-56cc-44d7-bbe9-29b7c4d15c8b" label="Manage SharePoint list permissions" />
          <DocLink href="https://learn.microsoft.com/en-us/power-automate/get-started-logic-flow" label="Get started with Power Automate" />
          <DocLink href="https://learn.microsoft.com/en-us/power-automate/triggers-introduction" label="Power Automate triggers overview" />
          <DocLink href="https://learn.microsoft.com/en-us/sharepoint/dev/general-development/rest-api" label="SharePoint REST API (advanced)" />
        </ul>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-5 text-center">
        <PartyPopper className="h-8 w-8 text-primary mx-auto mb-2" />
        <div className="font-bold">Ready to wire it up?</div>
        <div className="text-sm text-muted-foreground">
          When your two lists and the flow exist, tell me: <em>“Connect ERScapades to my SharePoint lists.”</em>
        </div>
      </div>
    </div>
  );
}

/* ---- Setup helpers ---- */

function SetupStep({ step, title, time, icon, children }: any) {
  const [open, setOpen] = useState(step <= 1);
  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <button type="button" onClick={() => setOpen((o: boolean) => !o)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors">
        <div className="h-9 w-9 rounded-full gradient-hero text-white grid place-items-center font-black shrink-0">{step}</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold flex items-center gap-2">{icon}{title}</div>
          <div className="text-xs text-muted-foreground">{time}</div>
        </div>
        {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 animate-rise-in space-y-3">{children}</div>}
    </div>
  );
}

function MiniPill({ icon, label }: any) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/70 border px-2.5 py-1 font-semibold">
      {icon}{label}
    </div>
  );
}

function PrereqRow({ ok, warn, label }: { ok?: boolean; warn?: boolean; label: string }) {
  const Icon = ok ? CheckCircle2 : warn ? AlertTriangle : HelpCircle;
  const color = ok ? "text-emerald-600" : warn ? "text-amber-600" : "text-muted-foreground";
  return (
    <li className="flex items-start gap-2">
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
      <span>{label}</span>
    </li>
  );
}

function ColumnTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="mt-2 rounded-lg border overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-muted/60">
          <tr>
            <th className="text-left p-2">Column name</th>
            <th className="text-left p-2">Type</th>
            <th className="text-left p-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([n, t, note]) => (
            <tr key={n} className="border-t align-top">
              <td className="p-2 font-mono whitespace-nowrap">
                <span className="inline-flex items-center gap-1">
                  {n}
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(n)}
                    className="opacity-60 hover:opacity-100"
                    aria-label={`Copy ${n}`}
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </span>
              </td>
              <td className="p-2">{t}</td>
              <td className="p-2 text-muted-foreground">{note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CopyChip({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { /* ignore */ }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 font-mono text-xs hover:bg-secondary"
    >
      {text}
      {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 opacity-70" />}
    </button>
  );
}

function CodeBlock({ code }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard?.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };
  return (
    <div className="relative rounded-lg border bg-slate-950 text-slate-100 overflow-hidden">
      <button
        type="button"
        onClick={onCopy}
        className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/20 px-2 py-1 text-[11px] font-semibold"
      >
        {copied ? <><CheckCircle2 className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
      </button>
      <pre className="text-xs p-3 pr-16 overflow-auto leading-relaxed"><code>{code}</code></pre>
    </div>
  );
}

function Callout({ tone, children }: { tone: "tip" | "warn" | "success"; children: React.ReactNode }) {
  const styles = {
    tip: "border-primary/30 bg-primary/5 text-foreground",
    warn: "border-amber-400/40 bg-amber-50 text-amber-950",
    success: "border-emerald-400/40 bg-emerald-50 text-emerald-950",
  }[tone];
  const icon = tone === "tip"
    ? <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
    : tone === "warn"
    ? <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
    : <PartyPopper className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />;
  return (
    <div className={`rounded-lg border p-3 flex items-start gap-2 text-sm ${styles}`}>
      {icon}
      <div>{children}</div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border bg-muted/30 overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2 text-left p-3 hover:bg-muted/60">
        {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
        <span className="font-semibold">{q}</span>
      </button>
      {open && <div className="px-9 pb-3 text-muted-foreground animate-rise-in">{a}</div>}
    </div>
  );
}

function DocLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
        <ExternalLink className="h-3.5 w-3.5" /> {label}
      </a>
    </li>
  );
}
