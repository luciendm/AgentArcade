import { Outlet, NavLink, Link } from "react-router-dom";
import { Home, Gamepad2, Trophy, Award, User, Flame, ShieldCheck, Ghost } from "lucide-react";
import { useAgent, levelProgress } from "@/lib/arcade-data";
import { AAALogo } from "@/components/arcade/AAALogo";

// NOTE: Admin / Coach is intentionally last so it stays anchored at the bottom
// of the sidebar navigation. Haunted Highway (seasonal) sits above it.
const NAV = [
  { to: "/", label: "Dashboard", icon: Home, end: true, seasonal: false },
  { to: "/missions", label: "Missions", icon: Gamepad2, seasonal: false },
  { to: "/achievements", label: "Achievements", icon: Award, seasonal: false },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy, seasonal: false },
  { to: "/profile", label: "Profile", icon: User, seasonal: false },
  { to: "/haunted-highway", label: "Haunted Highway", icon: Ghost, seasonal: true },
  { to: "/admin", label: "Admin / Coach", icon: ShieldCheck, seasonal: false, anchorBottom: true },
];

export default function Layout() {
  const agent = useAgent();
  const lp = levelProgress(agent.totalXp);

  const primaryNav = NAV.filter((n) => !n.anchorBottom);
  const bottomNav = NAV.filter((n) => n.anchorBottom);

  const renderNavLink = (n: typeof NAV[number]) => (
    <NavLink
      key={n.to}
      to={n.to}
      end={n.end}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all shrink-0 relative",
          isActive
            ? "gradient-hero text-white shadow-md"
            : "text-foreground/80 hover:bg-secondary hover:text-foreground",
          n.seasonal && !isActive
            ? "ring-1 ring-orange-300/50 bg-orange-50/40 hover:bg-orange-100/50"
            : "",
        ].join(" ")
      }
      aria-label={n.label}
    >
      <n.icon className="h-4 w-4" />
      <span>{n.label}</span>
      {n.seasonal && (
        <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-orange-600 animate-pulse">
          New
        </span>
      )}
    </NavLink>
  );

  return (
    <div className="bg-background text-foreground min-h-svh">
      <div className="mx-auto max-w-7xl md:grid md:grid-cols-[260px_1fr] gap-6 px-3 md:px-6 py-4">
        {/* Sidebar */}
        <aside className="md:sticky md:top-4 md:h-[calc(100svh-2rem)] rounded-2xl bg-card/90 backdrop-blur border shadow-sm p-4 flex flex-col gap-4 mb-4 md:mb-0">
          <Link to="/" className="flex items-center gap-2">
            <AAALogo className="h-11 w-14 shrink-0 animate-float-slow" />
            <div className="font-black tracking-tight leading-tight text-lg">
              <span className="text-primary">ERS</span>
              <span style={{ color: "#003DA5" }}>capades</span>
            </div>
          </Link>
          <div className="h-1 rounded-full stripe-flag opacity-70" aria-hidden="true" />

          {/* Agent card */}
          <div className="rounded-xl border bg-gradient-to-br from-secondary to-background p-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full grid place-items-center text-2xl bg-white shadow border">
                <span>{agent.avatar}</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{agent.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">Reports to {agent.manager}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[11px] font-bold">
                Level {lp.level}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-[11px] font-bold">
                <Flame className="h-3 w-3" /> {agent.streak}d
              </span>
            </div>
            <div className="mt-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full gradient-hero transition-[width] duration-700"
                  style={{ width: `${Math.round(lp.pct * 100)}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>{lp.intoLevel} XP</span>
                <span>{lp.needed} XP</span>
              </div>
            </div>
          </div>

          {/* Primary nav */}
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {primaryNav.map(renderNavLink)}
          </nav>

          {/* Bottom-anchored nav (Admin / Coach) */}
          <div className="mt-auto flex flex-col gap-2">
            <nav className="flex md:flex-col gap-1">
              {bottomNav.map(renderNavLink)}
            </nav>
            <div className="text-[10px] text-muted-foreground hidden md:block">
              <div className="rounded-lg border p-2 bg-background/60">
                Tip: bite-sized missions between calls keep your ERS reflexes sharp.
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
