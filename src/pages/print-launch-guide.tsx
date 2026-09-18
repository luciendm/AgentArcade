import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer, LifeBuoy } from "lucide-react";

export default function PrintLaunchGuidePage() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "ERScapades — SharePoint & Power Automate Launch Guide";
    return () => { document.title = prevTitle; };
  }, []);

  const handlePrint = () => window.print();

  return (
    <div className="min-h-svh bg-white text-slate-900 print:bg-white">
      {/* Screen-only toolbar */}
      <div className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur print:hidden">
        <div className="mx-auto max-w-4xl px-6 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Admin
            </Link>
            <span className="text-xs text-slate-500 hidden sm:inline">Tip: use your browser’s Print dialog to save as PDF.</span>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-red-700"
          >
            <Printer className="h-4 w-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Print sheet */}
      <article className="mx-auto max-w-4xl px-6 md:px-10 py-10 print:py-0 print:px-0 print:max-w-none print-doc">
        {/* Cover */}
        <header className="border-b-4 border-red-600 pb-6 mb-8 flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-red-600 text-white grid place-items-center shadow-md shrink-0">
            <LifeBuoy className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] tracking-[0.25em] font-black text-slate-500 uppercase">Launch Guide</div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1 leading-tight">
              <span className="text-red-600">ERS</span>capades — SharePoint &amp; Power Automate Setup
            </h1>
            <p className="text-slate-600 mt-2 max-w-2xl">
              End-to-end steps to launch <b>ERScapades</b> with real admin tracking for AAA Emergency Roadside Service teams,
              using only what your M365 Enterprise license already includes.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
              <span><b>Audience:</b> Admins / Coaches</span>
              <span><b>Est. time:</b> 45–60 minutes</span>
              <span><b>Extra licenses needed:</b> None</span>
              <span><b>Version:</b> 1.0</span>
            </div>
          </div>
        </header>

        {/* TOC */}
        <section className="mb-8">
          <h2 className="text-lg font-black text-red-600 uppercase tracking-widest">Contents</h2>
          <ol className="mt-2 grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm list-decimal ml-5">
            <li>Before you begin — prerequisites</li>
            <li>Prepare your SharePoint site</li>
            <li>Create the ERScapades Progress list</li>
            <li>Create the ERScapades Profiles list</li>
            <li>Set list permissions</li>
            <li>Build the Power Automate flow (SaveProgress)</li>
            <li>Connect ERScapades to SharePoint</li>
            <li>Publish &amp; share the link</li>
            <li>Day-to-day monitoring</li>
            <li>Troubleshooting FAQ</li>
            <li>Permissions &amp; licensing recap</li>
            <li>Handy Microsoft docs</li>
          </ol>
        </section>

        {/* 0 */}
        <PrintStep n={0} title="Before you begin — prerequisites" time="~2 min">
          <ul className="space-y-1.5">
            <li>✅ M365 Enterprise license.</li>
            <li>✅ An existing SharePoint site you can add lists to.</li>
            <li>✅ Permission to create Power Automate flows (default for M365 users).</li>
            <li>✅ Ability to publish/share this app link to your organization.</li>
            <li>⚠️ Optional: a security group of coaches/admins. If you don't have one, use the <code>IsCoach</code> flag on the Profiles list.</li>
          </ul>
          <Callout><b>Have handy:</b> your SharePoint site URL (looks like <code>https://&lt;tenant&gt;.sharepoint.com/sites/&lt;yoursite&gt;</code>) and a list of agent emails for the initial Profiles seed.</Callout>
        </PrintStep>

        {/* 1 */}
        <PrintStep n={1} title="Prepare your SharePoint site" time="~5 min">
          <ol className="list-decimal ml-5 space-y-1.5">
            <li>Open your site: <code>https://&lt;tenant&gt;.sharepoint.com/sites/&lt;yoursite&gt;</code>.</li>
            <li>Click the gear ⚙️ (top right) → <b>Site permissions</b>. Confirm you are a <b>Site Owner</b> (or Member with contribute rights).</li>
            <li>Under <b>Site contents</b>, click <b>+ New → App</b>. This is where you'll add the two lists in steps 2 and 3.</li>
            <li>Copy your site URL to a notepad. You'll paste it later.</li>
          </ol>
          <Callout tone="tip">If <em>New list</em> is grayed out, ask your site owner to grant you <b>Edit</b> rights.</Callout>
        </PrintStep>

        {/* 2 */}
        <PrintStep n={2} title="Create the ERScapades Progress list" time="~10 min">
          <ol className="list-decimal ml-5 space-y-1.5">
            <li>On your SharePoint site: <b>+ New → List → Blank list</b>.</li>
            <li>Name: <b>ERScapades Progress</b> → Create.</li>
            <li>Rename the default <b>Title</b> column to <b>MissionName</b>.</li>
            <li>Click <b>+ Add column</b> for each row below and set the type shown:</li>
          </ol>
          <PrintColumnTable rows={PROGRESS_COLUMNS} />
          <Callout tone="tip">For the <b>Category</b> Choice column, add exactly these five options: <em>Empathy, De-escalation, Product, Compliance, Listening</em>. Match spelling or analytics won't group correctly.</Callout>
        </PrintStep>

        {/* 3 */}
        <PrintStep n={3} title="Create the ERScapades Profiles list" time="~7 min">
          <ol className="list-decimal ml-5 space-y-1.5">
            <li><b>+ New → List → Blank list</b>.</li>
            <li>Name: <b>ERScapades Profiles</b>.</li>
            <li>Rename <b>Title</b> → <b>AgentName</b>. Then add these columns:</li>
          </ol>
          <PrintColumnTable rows={PROFILES_COLUMNS} />
          <ol className="list-decimal ml-5 space-y-1.5 mt-3" start={4}>
            <li>Add one row per starting agent (email + name + team). This seeds the app.</li>
            <li>Mark yourself (and any other coach) <b>IsCoach = Yes</b>. The app hides the Admin tab from agents where this is No.</li>
          </ol>
        </PrintStep>

        {/* 4 */}
        <PrintStep n={4} title="Set list permissions" time="~5 min">
          <ol className="list-decimal ml-5 space-y-1.5">
            <li>On <b>ERScapades Progress</b>: gear ⚙️ → <b>List settings</b> → <b>Permissions for this list</b>.</li>
            <li>Click <b>Stop inheriting permissions</b>.</li>
            <li>Grant your agents' group <b>Contribute</b> (they can add rows but not edit others').</li>
            <li>Grant your coach group (or just yourself) <b>Full Control</b>.</li>
            <li>Repeat for <b>ERScapades Profiles</b>. Set agents to <b>Read</b> and coaches to <b>Full Control</b>.</li>
          </ol>
          <Callout tone="warn">Don't give agents <b>Full Control</b> — they could edit each other's XP. <b>Contribute</b> on Progress + <b>Read</b> on Profiles is the safe combo.</Callout>
        </PrintStep>

        {/* 5 */}
        <PrintStep n={5} title="Build the Power Automate flow (SaveProgress)" time="~15 min">
          <p className="mb-2">This flow is the pipe between ERScapades and SharePoint. The app POSTs a small JSON payload; the flow writes it to your lists. Standard SharePoint connector — no premium license.</p>
          <ol className="list-decimal ml-5 space-y-1.5">
            <li>Go to <b>make.powerautomate.com</b>.</li>
            <li><b>+ Create</b> → <b>Instant cloud flow</b>.</li>
            <li>Name: <b>ERScapades — SaveProgress</b>.</li>
            <li>Trigger: <b>“When an HTTP request is received.”</b> If this trigger is Premium in your tenant, use <b>PowerApps V2</b> instead — same idea, free.</li>
            <li>In the trigger, click <b>Use sample payload to generate schema</b> and paste:</li>
          </ol>
          <PrintCode code={FLOW_REQUEST_SCHEMA} />
          <ol className="list-decimal ml-5 space-y-1.5 mt-3" start={6}>
            <li>Add action: <b>SharePoint → Create item</b>.
              <ul className="list-disc ml-5 mt-1">
                <li>Site Address: your SharePoint site URL.</li>
                <li>List Name: <b>ERScapades Progress</b>.</li>
                <li>Map each field to the matching dynamic value from the trigger (AgentEmail → agentEmail, etc.).</li>
                <li>For <b>CompletedOn</b>, use expression <code>utcNow()</code>.</li>
              </ul>
            </li>
            <li>Add action: <b>SharePoint → Get items</b> on <b>ERScapades Profiles</b> with filter <code>AgentEmail eq '&#123;triggerBody()?.agentEmail&#125;'</code>.</li>
            <li>Add action: <b>SharePoint → Update item</b> on the returned profile row.
              <ul className="list-disc ml-5 mt-1">
                <li>TotalXP = existing TotalXP + xpEarned.</li>
                <li>Level = <code>div(TotalXP, 500)</code> (simple formula).</li>
                <li>LastActive = <code>utcNow()</code>.</li>
              </ul>
            </li>
            <li>Add final action: <b>Response</b> → status <b>200</b>, body <code>{`{"ok": true}`}</code>.</li>
            <li><b>Save</b> the flow, then open the trigger again to reveal the generated <b>HTTP POST URL</b>. Copy it — you'll paste it in step 6.</li>
          </ol>
          <Callout tone="tip">Test the flow directly from Power Automate's <b>Test</b> panel with a sample payload before wiring the app. If it creates a row in your Progress list, you're golden.</Callout>
        </PrintStep>

        {/* 6 */}
        <PrintStep n={6} title="Connect ERScapades to SharePoint" time="~10 min">
          <ol className="list-decimal ml-5 space-y-1.5">
            <li>Go back to the ERScapades chat/builder and say: <em>“Connect ERScapades to my SharePoint lists.”</em></li>
            <li>You'll be asked for three things — paste them in:
              <ul className="list-disc ml-5 mt-1">
                <li>Your SharePoint <b>site URL</b>.</li>
                <li>The Power Automate <b>SaveProgress HTTP URL</b> from step 5.</li>
                <li>Any special <b>team</b> label you want stamped on new profiles.</li>
              </ul>
            </li>
            <li>The app replaces its in-memory store with SharePoint reads (leaderboard, admin dashboard, profile) and posts to your flow on every mission completion.</li>
            <li>The signed-in M365 user's email becomes the agent identity. That's your SSO — no separate login needed.</li>
          </ol>
        </PrintStep>

        {/* 7 */}
        <PrintStep n={7} title="Publish & share the link" time="~3 min">
          <ol className="list-decimal ml-5 space-y-1.5">
            <li>Click <b>Publish</b> (or <b>Share</b>) at the top of this builder.</li>
            <li>Choose <b>“Anyone in my organization”</b> — this enforces M365 SSO automatically.</li>
            <li>Copy the link and send it via Teams, email, or pin it in a channel.</li>
            <li>First-time users: when they open the link and complete their first mission, the flow auto-creates their Profiles row.</li>
          </ol>
          <Callout tone="success">🎉 You're live! Open the <b>Overview</b> tab in the admin view and refresh — real data will start replacing the preview numbers as agents play.</Callout>
        </PrintStep>

        {/* 8 */}
        <PrintStep n={8} title="How you'll monitor (day-to-day)" time="ongoing">
          <ul className="list-disc ml-5 space-y-1.5">
            <li><b>This dashboard</b> — Overview + Agents tabs, updated live.</li>
            <li><b>SharePoint list views</b> — open the Progress list, <b>All items → Group by → AgentName</b> for a quick per-agent view. Export to Excel anytime.</li>
            <li><b>Weekly digest</b> — optional: a scheduled Power Automate flow (e.g., Mondays 8am) that emails the leaderboard to your team.</li>
            <li><b>CSV export</b> — the button at the top of the Admin page pulls the current view for stakeholder reports.</li>
          </ul>
        </PrintStep>

        {/* 9 Troubleshooting */}
        <PrintStep n={9} title="Troubleshooting FAQ" time="reference">
          <FAQPrint q="The flow says the HTTP trigger is Premium." a="Swap it for the PowerApps V2 trigger — same schema, no license needed. If you use PowerApps V2, the app will call the flow through the built-in connector instead of a raw URL." />
          <FAQPrint q="Agents see 'Access denied' when they play." a="Their account needs Contribute on ERScapades Progress. Re-check step 4. Also make sure your agents' security group is added directly, not through nested groups." />
          <FAQPrint q="XP totals look wrong." a="The Update item action in step 5 might not be reading the existing TotalXP. Add a Get item action before Update to fetch the current value, then reference it in the sum." />
          <FAQPrint q="I want to hide the Admin tab from agents." a="The app reads IsCoach on the Profiles list. If it's No (or missing), the Admin/Coach nav item is hidden. Set it to Yes for coaches only." />
          <FAQPrint q="Can I add my own custom missions later?" a="Yes. Ask the ERScapades chat: 'Add a new mission called <name>' and it will drop it into the app. Later, missions can also be driven from a third SharePoint list for zero-code editing." />
        </PrintStep>

        {/* Permissions recap */}
        <section className="break-inside-avoid mb-8">
          <h2 className="text-lg font-black text-red-600 uppercase tracking-widest">Permissions &amp; licensing recap</h2>
          <table className="w-full text-sm mt-3 border border-slate-300">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left p-2 border-b border-slate-300">Capability</th>
                <th className="text-left p-2 border-b border-slate-300 w-24">Included?</th>
                <th className="text-left p-2 border-b border-slate-300">Notes</th>
              </tr>
            </thead>
            <tbody>
              {LICENSING.map(([cap, ok, note]) => (
                <tr key={cap as string} className="border-b border-slate-200 align-top">
                  <td className="p-2 font-semibold">{cap}</td>
                  <td className="p-2">{ok ? "✅ Yes" : "⚠️ Maybe"}</td>
                  <td className="p-2 text-slate-600">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Docs */}
        <section className="break-inside-avoid mb-8">
          <h2 className="text-lg font-black text-red-600 uppercase tracking-widest">Handy Microsoft docs</h2>
          <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
            <li>Create a SharePoint list — <span className="break-all">https://learn.microsoft.com/en-us/sharepoint/create-a-list</span></li>
            <li>Manage SharePoint list permissions — <span className="break-all">https://support.microsoft.com/en-us/office/set-up-and-manage-list-permissions-cd6a4c2f-56cc-44d7-bbe9-29b7c4d15c8b</span></li>
            <li>Get started with Power Automate — <span className="break-all">https://learn.microsoft.com/en-us/power-automate/get-started-logic-flow</span></li>
            <li>Power Automate triggers overview — <span className="break-all">https://learn.microsoft.com/en-us/power-automate/triggers-introduction</span></li>
            <li>SharePoint REST API (advanced) — <span className="break-all">https://learn.microsoft.com/en-us/sharepoint/dev/general-development/rest-api</span></li>
          </ul>
        </section>

        {/* Sign off */}
        <footer className="border-t-4 border-red-600 pt-4 mt-10 text-xs text-slate-500 flex flex-wrap justify-between gap-2">
          <div>
            <span className="text-red-600 font-black">ERS</span>capades — AAA Emergency Roadside Service · Learn. Level up. Roll out.
          </div>
          <div>Launch guide v1.0 · Printed from the Admin / Coach view</div>
        </footer>
      </article>

      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: Letter; margin: 0.6in; }
          html, body { background: white !important; }
          .print-doc { color: #0f172a; }
          .print-doc a { color: #0f172a; text-decoration: underline; }
          .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function PrintStep({ n, title, time, children }: { n: number; title: string; time: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid mb-8">
      <div className="flex items-baseline gap-3 border-b border-slate-300 pb-2 mb-3">
        <div className="h-9 w-9 rounded-full bg-red-600 text-white grid place-items-center font-black shrink-0">{n}</div>
        <div className="flex-1">
          <h2 className="text-xl font-black tracking-tight">{title}</h2>
          <div className="text-xs uppercase tracking-widest text-slate-500">{time}</div>
        </div>
      </div>
      <div className="text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function Callout({ children, tone = "tip" }: { children: React.ReactNode; tone?: "tip" | "warn" | "success" }) {
  const styles =
    tone === "warn" ? "border-amber-500 bg-amber-50" :
      tone === "success" ? "border-emerald-500 bg-emerald-50" :
        "border-red-500 bg-red-50";
  const label =
    tone === "warn" ? "Heads up" :
      tone === "success" ? "You're set" :
        "Tip";
  return (
    <div className={`mt-3 border-l-4 ${styles} p-3 rounded-r-md text-sm`}>
      <div className="text-[10px] uppercase font-black tracking-widest text-slate-700">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function PrintColumnTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <table className="w-full text-xs mt-3 border border-slate-300">
      <thead className="bg-slate-100">
        <tr>
          <th className="text-left p-2 border-b border-slate-300">Column name</th>
          <th className="text-left p-2 border-b border-slate-300">Type</th>
          <th className="text-left p-2 border-b border-slate-300">Notes</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([n, t, note]) => (
          <tr key={n} className="border-b border-slate-200 align-top">
            <td className="p-2 font-mono whitespace-nowrap">{n}</td>
            <td className="p-2">{t}</td>
            <td className="p-2 text-slate-600">{note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PrintCode({ code }: { code: string }) {
  return (
    <pre className="mt-2 text-[11px] leading-relaxed bg-slate-50 border border-slate-300 rounded-md p-3 overflow-auto whitespace-pre-wrap break-words">
      <code>{code}</code>
    </pre>
  );
}

function FAQPrint({ q, a }: { q: string; a: string }) {
  return (
    <div className="mt-2">
      <div className="font-bold">Q: {q}</div>
      <div className="text-slate-700">A: {a}</div>
    </div>
  );
}

/* ---------- Data ---------- */

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
  ["Team", "Single line of text", "e.g. 'Long Beach — Team Bowen'."],
  ["TotalXP", "Number", "Running total."],
  ["Level", "Number", "Computed from TotalXP."],
  ["CurrentStreak", "Number", "Days in a row learning."],
  ["LastActive", "Date and time", "Updated on each save."],
  ["IsCoach", "Yes/No", "Controls access to the Admin/Coach view."],
];

const FLOW_REQUEST_SCHEMA = `{
  "type": "object",
  "properties": {
    "agentEmail":     { "type": "string"  },
    "agentName":      { "type": "string"  },
    "missionId":      { "type": "string"  },
    "missionName":    { "type": "string"  },
    "category":       { "type": "string"  },
    "score":          { "type": "integer" },
    "totalQuestions": { "type": "integer" },
    "accuracyPct":    { "type": "integer" },
    "xpEarned":       { "type": "integer" },
    "badgeEarned":    { "type": "string"  },
    "completedOn":    { "type": "string"  }
  },
  "required": ["agentEmail", "missionId", "xpEarned"]
}`;

const LICENSING: [string, boolean, string][] = [
  ["SharePoint site + lists", true, "Included with M365 Enterprise"],
  ["Microsoft Lists UI", true, "Included with M365 Enterprise"],
  ["Power Automate — standard connectors", true, "Included with M365 Enterprise"],
  ["Power Automate — HTTP request trigger", false, "Premium in some tenants — use PowerApps V2 as fallback"],
  ["SSO via M365 sign-in on the app link", true, "Automatic when shared org-wide"],
  ["Dataverse", false, "Requires premium license — not needed here"],
];
