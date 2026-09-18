import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { Pencil, Check, X, User, Briefcase, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/arcade/PageHeader";
import { Shimmer } from "@/components/arcade/Shimmer";
import {
  useAgent, useXpHistory, useSkills, useCompletionByCategory,
  useUpdateAgent, useSimulatedLoad,
  CATEGORIES, getCategory, levelProgress, AVATAR_CHOICES,
} from "@/lib/arcade-data";

export default function ProfilePage() {
  const agent = useAgent();
  const xpHistory = useXpHistory();
  const skills = useSkills();
  const completion = useCompletionByCategory();
  const updateAgent = useUpdateAgent();
  const loading = useSimulatedLoad(500);

  const lp = levelProgress(agent.totalXp);

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(agent.name);
  const [avatarDraft, setAvatarDraft] = useState(agent.avatar);

  function startEdit() {
    setNameDraft(agent.name);
    setAvatarDraft(agent.avatar);
    setEditing(true);
  }
  function saveEdit() {
    updateAgent({ name: nameDraft.trim() || agent.name, avatar: avatarDraft });
    setEditing(false);
  }
  function cancelEdit() { setEditing(false); }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your journey"
        title="Profile & Progress"
        subtitle="Track how your ERS skills are growing — mission by mission, member by member."
      />

      {/* Identity card */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="h-2 stripe-flag" aria-hidden="true" />
        <div className="p-5 flex flex-wrap items-center gap-5">
          <div className="h-20 w-20 rounded-2xl grid place-items-center text-5xl bg-secondary shadow-inner">
            {editing ? avatarDraft : agent.avatar}
          </div>
          <div className="flex-1 min-w-[240px]">
            {editing ? (
              <div className="space-y-2">
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="w-full max-w-sm rounded-lg border bg-background px-3 py-2 text-lg font-bold"
                  aria-label="Display name"
                />
                <div className="flex flex-wrap gap-1.5">
                  {AVATAR_CHOICES.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvatarDraft(a)}
                      className={[
                        "h-9 w-9 rounded-lg grid place-items-center text-xl border transition-all",
                        avatarDraft === a ? "border-primary bg-primary/10 scale-110" : "border-transparent hover:bg-secondary",
                      ].join(" ")}
                      aria-label={`Choose avatar ${a}`}
                    >{a}</button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-black tracking-tight flex items-center gap-2 flex-wrap">
                  <User className="h-5 w-5 text-primary" />
                  {agent.name}
                  <span className="text-muted-foreground font-semibold text-base">→</span>
                  <span className="text-base font-bold text-secondary-foreground bg-secondary rounded-full px-3 py-0.5 inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> {agent.manager}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {agent.jobTitle}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {agent.officeLocation}</span>
                  <span className="text-muted-foreground/70">·</span>
                  <span>{agent.team}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Immediate supervisor: <span className="font-semibold text-foreground">{agent.manager}</span> · {agent.managerTitle}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5">Level {lp.level}</span>
                  <span className="rounded-full bg-secondary-foreground text-white px-2 py-0.5">{agent.totalXp.toLocaleString()} XP</span>
                  <span className="rounded-full bg-orange-100 text-orange-700 px-2 py-0.5">🔥 {agent.streak}-day streak</span>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button type="button" onClick={saveEdit} className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-3 py-2 shadow hover:scale-[1.02] transition-transform">
                  <Check className="h-4 w-4" /> Save
                </button>
                <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-2 rounded-xl border bg-card px-3 py-2 font-semibold hover:bg-secondary">
                  <X className="h-4 w-4" /> Cancel
                </button>
              </>
            ) : (
              <button type="button" onClick={startEdit} className="inline-flex items-center gap-2 rounded-xl border bg-card px-3 py-2 font-semibold hover:bg-secondary">
                <Pencil className="h-4 w-4" /> Edit profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="XP earned (last 30 days)" subtitle="Daily learning momentum">
          {loading ? <Shimmer className="h-64" /> : <XPLineChart data={xpHistory} />}
        </ChartCard>
        <ChartCard title="Skills radar" subtitle="Your strengths across categories">
          {loading ? <Shimmer className="h-64" /> : <RadarChart data={skills} />}
        </ChartCard>
        <ChartCard title="Completion by category" subtitle="Missions completed vs. available">
          {loading ? <Shimmer className="h-64" /> : <DonutChart data={completion} />}
        </ChartCard>
        <ChartCard title="Category legend" subtitle="What the colors mean">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
            {CATEGORIES.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border bg-background/50 px-3 py-2">
                <div className="h-8 w-8 rounded-lg grid place-items-center text-lg" style={{ background: c.color, color: "white" }}>{c.emoji}</div>
                <div>
                  <div className="text-sm font-bold">{c.label}</div>
                  <div className="text-[11px] text-muted-foreground">{skills.find(s => s.category === c.id)?.level ?? 0}% mastery</div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm p-4">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="font-bold">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ---------------- XP Line chart ---------------- */
function XPLineChart({ data }: { data: { date: string; xp: number }[] }) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [tt, setTt] = useState<{ x: number; y: number; date: string; xp: number } | null>(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = 520;
    const height = 240;
    const margin = { top: 12, right: 16, bottom: 28, left: 40 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", 240)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const parsed = data.map(d => ({ date: new Date(d.date), xp: d.xp }));

    const x = d3.scaleTime()
      .domain(d3.extent(parsed, d => d.date) as [Date, Date])
      .range([0, innerW]);
    const y = d3.scaleLinear()
      .domain([0, (d3.max(parsed, d => d.xp) ?? 100) * 1.15])
      .range([innerH, 0]);

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat(() => "") as any)
      .selectAll("line").attr("stroke", "oklch(0.92 0.02 250)");
    g.selectAll(".grid path").remove();

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%b %d") as any))
      .selectAll("text").attr("fill", "oklch(0.5 0.05 260)").style("font-size", "10px");
    g.selectAll("path.domain").attr("stroke", "oklch(0.85 0.02 250)");
    g.append("g")
      .call(d3.axisLeft(y).ticks(4))
      .selectAll("text").attr("fill", "oklch(0.5 0.05 260)").style("font-size", "10px");

    const defs = svg.append("defs");
    const grad = defs.append("linearGradient").attr("id", "xp-line-grad").attr("x1", "0").attr("x2", "0").attr("y1", "0").attr("y2", "1");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "oklch(0.55 0.24 27)").attr("stop-opacity", 0.5);
    grad.append("stop").attr("offset", "100%").attr("stop-color", "oklch(0.42 0.19 260)").attr("stop-opacity", 0);

    const area = d3.area<{ date: Date; xp: number }>()
      .x(d => x(d.date))
      .y0(innerH)
      .y1(d => y(d.xp))
      .curve(d3.curveCatmullRom.alpha(0.6));

    const line = d3.line<{ date: Date; xp: number }>()
      .x(d => x(d.date))
      .y(d => y(d.xp))
      .curve(d3.curveCatmullRom.alpha(0.6));

    g.append("path").datum(parsed).attr("d", area as any).attr("fill", "url(#xp-line-grad)");
    const path = g.append("path").datum(parsed).attr("d", line as any)
      .attr("fill", "none").attr("stroke", "oklch(0.55 0.24 27)").attr("stroke-width", 2.5);
    const totalLen = (path.node() as SVGPathElement).getTotalLength();
    path.attr("stroke-dasharray", `${totalLen} ${totalLen}`)
      .attr("stroke-dashoffset", totalLen)
      .transition().duration(1200).ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);

    const focus = g.append("circle").attr("r", 5).attr("fill", "white").attr("stroke", "oklch(0.55 0.24 27)").attr("stroke-width", 2).style("opacity", 0);

    g.append("rect")
      .attr("width", innerW).attr("height", innerH).attr("fill", "transparent")
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const bisect = d3.bisector((d: any) => d.date).left;
        const x0 = x.invert(mx);
        const idx = bisect(parsed, x0);
        const d = parsed[Math.min(idx, parsed.length - 1)];
        if (!d) return;
        const cx = x(d.date); const cy = y(d.xp);
        focus.attr("cx", cx).attr("cy", cy).style("opacity", 1);
        setTt({ x: cx + margin.left, y: cy + margin.top, date: d3.timeFormat("%b %d")(d.date), xp: d.xp });
      })
      .on("mouseleave", () => { focus.style("opacity", 0); setTt(null); });
  }, [data]);

  return (
    <div className="relative">
      <svg ref={ref} />
      {tt && (
        <div
          className="pointer-events-none absolute rounded-lg bg-foreground text-background text-xs font-semibold px-2 py-1 shadow -translate-x-1/2 -translate-y-full"
          style={{ left: tt.x, top: tt.y - 8 }}
        >
          {tt.date}: {tt.xp} XP
        </div>
      )}
      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-4 rounded-sm bg-primary" /> Daily XP</span>
      </div>
    </div>
  );
}

/* ---------------- Radar chart ---------------- */
function RadarChart({ data }: { data: { category: string; level: number }[] }) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [tt, setTt] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const size = 260;
    const radius = 90;
    svg.attr("viewBox", `0 0 ${size} ${size}`).attr("width", "100%").attr("height", 260);
    const g = svg.append("g").attr("transform", `translate(${size / 2},${size / 2})`);

    const N = data.length;
    const angle = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2;

    [0.25, 0.5, 0.75, 1].forEach((r) => {
      g.append("circle").attr("r", radius * r).attr("fill", "none").attr("stroke", "oklch(0.92 0.02 250)");
    });
    data.forEach((d, i) => {
      const x2 = Math.cos(angle(i)) * radius;
      const y2 = Math.sin(angle(i)) * radius;
      g.append("line").attr("x1", 0).attr("y1", 0).attr("x2", x2).attr("y2", y2).attr("stroke", "oklch(0.92 0.02 250)");
      const label = getCategory(d.category as any).label;
      g.append("text")
        .attr("x", Math.cos(angle(i)) * (radius + 14))
        .attr("y", Math.sin(angle(i)) * (radius + 14))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "10px")
        .attr("fill", "oklch(0.4 0.06 260)")
        .text(label);
    });

    const points = data.map((d, i) => {
      const r = (d.level / 100) * radius;
      return [Math.cos(angle(i)) * r, Math.sin(angle(i)) * r];
    });
    const pathStr = "M" + points.map(p => `${p[0]},${p[1]}`).join("L") + "Z";

    const poly = g.append("path")
      .attr("d", pathStr)
      .attr("fill", "oklch(0.55 0.24 27 / 0.25)")
      .attr("stroke", "oklch(0.55 0.24 27)")
      .attr("stroke-width", 2);
    poly.style("transform", "scale(0)").style("transform-origin", "center").transition().duration(900).style("transform", "scale(1)");

    data.forEach((d, i) => {
      const [px, py] = points[i];
      g.append("circle")
        .attr("cx", px).attr("cy", py).attr("r", 5)
        .attr("fill", getCategory(d.category as any).color)
        .attr("stroke", "white").attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseenter", () => setTt({ x: size / 2 + px, y: size / 2 + py, label: getCategory(d.category as any).label, value: d.level }))
        .on("mouseleave", () => setTt(null));
    });
  }, [data]);

  return (
    <div className="relative">
      <svg ref={ref} />
      {tt && (
        <div
          className="pointer-events-none absolute rounded-lg bg-foreground text-background text-xs font-semibold px-2 py-1 shadow -translate-x-1/2 -translate-y-full"
          style={{ left: tt.x, top: tt.y - 8 }}
        >
          {tt.label}: {tt.value}%
        </div>
      )}
    </div>
  );
}

/* ---------------- Donut chart ---------------- */
function DonutChart({ data }: { data: { category: string; completed: number; total: number }[] }) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [tt, setTt] = useState<{ x: number; y: number; label: string; value: string } | null>(null);

  const totals = useMemo(() => data.map(d => ({
    category: d.category,
    label: getCategory(d.category as any).label,
    color: getCategory(d.category as any).color,
    value: d.completed,
    total: d.total,
  })), [data]);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const size = 260;
    svg.attr("viewBox", `0 0 ${size} ${size}`).attr("width", "100%").attr("height", 260);
    const g = svg.append("g").attr("transform", `translate(${size / 2},${size / 2})`);

    const radius = 100;
    const inner = 62;
    const pie = d3.pie<any>().value(d => d.value).sort(null);
    const arc = d3.arc<any>().innerRadius(inner).outerRadius(radius).padAngle(0.02).cornerRadius(4);

    const arcs = pie(totals);
    g.selectAll("path").data(arcs).enter().append("path")
      .attr("d", arc as any)
      .attr("fill", (d: any) => d.data.color)
      .attr("stroke", "white").attr("stroke-width", 2)
      .style("cursor", "pointer")
      .each(function (d: any) { (this as any)._current = { ...d, endAngle: d.startAngle }; })
      .transition().duration(900)
      .attrTween("d", function (d: any) {
        const i = d3.interpolate((this as any)._current, d);
        (this as any)._current = i(1);
        return (t: number) => arc(i(t)) as string;
      });

    g.selectAll("path")
      .on("mouseenter", function (_event: any, d: any) {
        const [cx, cy] = arc.centroid(d);
        setTt({ x: size / 2 + cx, y: size / 2 + cy, label: d.data.label, value: `${d.data.value}/${d.data.total} completed` });
      })
      .on("mouseleave", () => setTt(null));

    const totalCompleted = totals.reduce((a, b) => a + b.value, 0);
    const totalAll = totals.reduce((a, b) => a + b.total, 0);

    g.append("text").attr("text-anchor", "middle").attr("y", -4)
      .style("font-size", "26px").style("font-weight", "800")
      .attr("fill", "oklch(0.22 0.05 260)").text(String(totalCompleted));
    g.append("text").attr("text-anchor", "middle").attr("y", 16)
      .style("font-size", "10px").style("letter-spacing", "2px").style("text-transform", "uppercase")
      .attr("fill", "oklch(0.5 0.05 260)").text(`of ${totalAll} missions`);
  }, [totals]);

  return (
    <div className="relative">
      <svg ref={ref} />
      {tt && (
        <div
          className="pointer-events-none absolute rounded-lg bg-foreground text-background text-xs font-semibold px-2 py-1 shadow -translate-x-1/2 -translate-y-full"
          style={{ left: tt.x, top: tt.y - 8 }}
        >
          {tt.label}: {tt.value}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-2 justify-center text-xs">
        {totals.map(t => (
          <div key={t.category} className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: t.color }} />
            <span className="text-muted-foreground">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
