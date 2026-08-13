import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/crisis/AppShell";
import { PageHeader, Stat } from "@/components/crisis/ui-bits";
import { useCrisis } from "@/lib/crisis/store";

export const Route = createFileRoute("/analytics")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Analytics — CrisisMesh" },
      { name: "description", content: "Response metrics: incident mix, urgency spread, channel volume and resolution rate." },
      { property: "og:title", content: "Analytics — CrisisMesh" },
      { property: "og:description", content: "Data-driven view of the crisis response operation." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const state = useCrisis();

  const data = useMemo(() => {
    const byType: Record<string, number> = {};
    const byUrgency: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byLocation: Record<string, number> = {};
    for (const i of state.incidents) {
      byType[i.type] = (byType[i.type] ?? 0) + 1;
      byUrgency[i.urgency] = (byUrgency[i.urgency] ?? 0) + 1;
      byLocation[i.location] = (byLocation[i.location] ?? 0) + 1;
    }
    for (const r of state.reports) bySource[r.source] = (bySource[r.source] ?? 0) + 1;

    const resolved = state.incidents.filter((i) => i.status === "resolved").length;
    const merged = state.reports.filter((r) => r.status === "merged").length;
    const assigned = state.incidents.filter((i) => i.assignedVolunteerId).length;
    const avgPriority = state.incidents.length
      ? Math.round(state.incidents.reduce((a, i) => a + i.priorityScore, 0) / state.incidents.length)
      : 0;
    const avgConfidence = state.incidents.length
      ? Math.round((state.incidents.reduce((a, i) => a + i.confidence, 0) / state.incidents.length) * 100)
      : 0;

    return { byType, byUrgency, bySource, byLocation, resolved, merged, assigned, avgPriority, avgConfidence };
  }, [state.incidents, state.reports]);

  const dedupRate = state.reports.length ? Math.round((data.merged / state.reports.length) * 100) : 0;
  const resolveRate = state.incidents.length ? Math.round((data.resolved / state.incidents.length) * 100) : 0;

  return (
    <AppShell>
      <PageHeader title="Analytics" subtitle="Metrics computed live from the current operational dataset." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Reports ingested" value={String(state.reports.length)} hint={`${data.merged} merged as duplicates`} />
        <Stat label="Deduplication rate" value={`${dedupRate}%`} hint="Reports folded into existing incidents" />
        <Stat label="Resolution rate" value={`${resolveRate}%`} hint={`${data.resolved} incidents resolved`} />
        <Stat label="Avg AI confidence" value={`${data.avgConfidence}%`} hint={`Avg priority ${data.avgPriority}/100`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Bars title="Incidents by type" data={data.byType} />
        <Bars title="Incidents by urgency" data={data.byUrgency} />
        <Bars title="Reports by channel" data={data.bySource} />
        <Bars title="Top affected locations" data={data.byLocation} limit={6} />
      </div>

      <div className="panel mt-4 p-4">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Operational summary</h2>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>
            <span className="text-foreground">{data.assigned}</span> of {state.incidents.length} incidents have an assigned responder.
          </li>
          <li>
            <span className="text-foreground">{state.volunteers.filter((v) => v.status === "available").length}</span> volunteers are
            currently available for dispatch.
          </li>
          <li>
            <span className="text-foreground">{state.resources.filter((r) => r.available === 0).length}</span> resource lines are depleted
            and need resupply.
          </li>
          <li>
            <span className="text-foreground">{state.audit.filter((a) => a.category === "ai").length}</span> AI actions logged, all
            reviewable in the audit trail.
          </li>
        </ul>
      </div>
    </AppShell>
  );
}

function Bars({ title, data, limit = 8 }: { title: string; data: Record<string, number>; limit?: number }) {
  const rows = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="panel p-4">
      <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">{title}</h2>
      <div className="mt-3 space-y-2">
        {rows.map(([k, v]) => (
          <div key={k}>
            <div className="flex justify-between text-xs">
              <span className="capitalize">{k.replace(/_/g, " ")}</span>
              <span className="font-mono text-muted-foreground">{v}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-ai" style={{ width: `${(v / max) * 100}%` }} />
            </div>
          </div>
        ))}
        {rows.length === 0 ? <p className="text-xs text-muted-foreground">No data yet.</p> : null}
      </div>
    </div>
  );
}
