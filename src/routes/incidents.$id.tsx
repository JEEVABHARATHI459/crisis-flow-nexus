import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/crisis/AppShell";
import { EmptyState, PageHeader, SafetyNote, StatusBadge, UrgencyBadge, clock } from "@/components/crisis/ui-bits";
import { AssignDialog } from "@/components/crisis/AssignDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { actions, matchResources, useCrisis } from "@/lib/crisis/store";
import type { IncidentStatus } from "@/lib/crisis/types";

export const Route = createFileRoute("/incidents/$id")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `Incident ${params.id} — CrisisMesh` },
      { name: "description", content: `Full detail, source reports, timeline and resource matching for incident ${params.id}.` },
      { property: "og:title", content: `Incident ${params.id} — CrisisMesh` },
      { property: "og:description", content: "Consolidated incident detail with AI priority explanation." },
    ],
  }),
  component: IncidentDetail,
});

const STATUSES: IncidentStatus[] = ["new", "under_review", "prioritized", "assigned", "in_progress", "resolved", "cancelled"];

function IncidentDetail() {
  const { id } = Route.useParams();
  const state = useCrisis();
  const navigate = useNavigate();
  const [showWhy, setShowWhy] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [editScore, setEditScore] = useState("");

  const inc = state.incidents.find((i) => i.id === id);

  if (!inc) {
    return (
      <AppShell>
        <EmptyState title="Incident not found" hint={`No incident with ID ${id}.`} />
        <div className="mt-4">
          <Button onClick={() => navigate({ to: "/incidents" })}>Back to Incidents</Button>
        </div>
      </AppShell>
    );
  }

  const reports = state.reports.filter((r) => inc.reportIds.includes(r.id));
  const volunteer = state.volunteers.find((v) => v.id === inc.assignedVolunteerId);
  const tasks = state.tasks.filter((t) => t.incidentId === inc.id);
  const timeline = state.audit.filter((a) => a.entity === inc.id || inc.reportIds.includes(a.entity)).slice(0, 20).reverse();

  return (
    <AppShell>
      <PageHeader
        title={`${inc.id} — ${inc.type}`}
        subtitle={`${inc.location} • ${inc.affectedPeople} affected • needs ${inc.requiredResource}`}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate({ to: "/incidents" })}>
              Back
            </Button>
            <Button onClick={() => setShowMatch(true)}>FIND BEST RESOURCE</Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="panel space-y-3 p-4 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <UrgencyBadge urgency={inc.urgency} />
            <StatusBadge status={inc.status} />
            {inc.verified ? (
              <span className="rounded-full border border-resolved/40 bg-resolved/10 px-2 py-0.5 text-[10px] tracking-widest text-resolved uppercase">
                Human verified
              </span>
            ) : null}
            <span className="ml-auto text-xs text-muted-foreground">
              Created {clock(inc.createdAt)} • Updated {clock(inc.updatedAt)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Field k="Priority score" v={`${inc.priorityScore}/100`} />
            <Field k="Confidence" v={`${Math.round(inc.confidence * 100)}%`} />
            <Field k="Source reports" v={String(inc.reportIds.length)} />
            <Field k="Assigned" v={volunteer ? `${volunteer.name} (${volunteer.team})` : "Unassigned"} />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            <select
              value={inc.status}
              onChange={(e) => {
                const next = e.target.value as IncidentStatus;
                if (next === "resolved" && inc.urgency === "critical" && !inc.verified) {
                  toast.error("Critical incidents require human verification before closure. Accept the priority first.");
                  return;
                }
                actions.setIncidentStatus(inc.id, next);
                toast.success(`Status updated to ${next.replace("_", " ").toUpperCase()}`);
              }}
              className="h-9 rounded-md border border-border bg-card px-2 text-xs"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
            <Button size="sm" variant="outline" onClick={() => setShowWhy(true)}>
              WHY THIS PRIORITY?
            </Button>
          </div>

          <div>
            <h2 className="mt-4 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              {reports.length} reports consolidated
            </h2>
            <ul className="mt-2 space-y-2">
              {reports.map((r) => (
                <li key={r.id} className="rounded border border-border bg-card p-2 text-xs">
                  <span className="font-mono font-bold">#{r.id}</span>{" "}
                  <span className="tracking-widest text-muted-foreground uppercase">{r.source}</span>
                  {r.status === "merged" ? (
                    <span className="ml-2 rounded border border-ai/40 bg-ai/10 px-1 text-[10px] tracking-widest text-ai">MERGED</span>
                  ) : null}
                  <p className="mt-1">{r.message}</p>
                </li>
              ))}
            </ul>
          </div>

          {tasks.length > 0 ? (
            <div>
              <h2 className="mt-4 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Tasks</h2>
              <ul className="mt-2 space-y-2">
                {tasks.map((tk) => (
                  <li key={tk.id} className="flex items-center gap-2 rounded border border-border bg-card p-2 text-xs">
                    <span className="font-mono font-bold">{tk.id}</span>
                    <span>{tk.description}</span>
                    <span className="ml-auto">
                      <StatusBadge status={tk.status} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="panel p-4">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Priority engine</h2>
            <p className="mt-2 font-mono text-4xl font-bold text-ai">{inc.priorityScore}/100</p>
            <ul className="mt-3 space-y-1 text-xs">
              {inc.priorityFactors.map((f) => (
                <li key={f.label} className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-mono text-resolved">+{f.points}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-4">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Timeline</h2>
            <ol className="mt-3 space-y-2 text-xs">
              {timeline.map((a) => (
                <li key={a.id} className="flex gap-2">
                  <span className="font-mono text-muted-foreground">{clock(a.ts)}</span>
                  <span>
                    <span className="font-semibold text-ai">{a.action}</span>
                    <br />
                    <span className="text-muted-foreground">{a.details}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      <SafetyNote />

      <Dialog open={showWhy} onOpenChange={setShowWhy}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-mono tracking-widest">AI RECOMMENDATION — PRIORITY {inc.priorityScore}</DialogTitle>
          </DialogHeader>
          <ul className="space-y-1 text-sm">
            {inc.priorityFactors.map((f) => (
              <li key={f.label} className="flex justify-between border-b border-border/50 pb-1">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="font-mono text-resolved">+{f.points}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-md border border-high/40 bg-high/10 p-2 text-xs">
            This is an AI-assisted recommendation and requires human verification.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                actions.verifyPriority(inc.id, "accept");
                toast.success("Priority accepted");
                setShowWhy(false);
              }}
            >
              ACCEPT
            </Button>
            <input
              value={editScore}
              onChange={(e) => setEditScore(e.target.value)}
              placeholder="new score"
              className="h-9 w-24 rounded-md border border-border bg-card px-2 text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const n = Number(editScore);
                if (!n || n < 1 || n > 100) return toast.error("Enter a score between 1 and 100");
                actions.verifyPriority(inc.id, "accept", n);
                toast.success(`Priority set to ${n}`);
                setShowWhy(false);
              }}
            >
              EDIT
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                actions.verifyPriority(inc.id, "reject");
                toast.info("AI recommendation rejected");
                setShowWhy(false);
              }}
            >
              REJECT
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AssignDialog
        incident={showMatch ? inc : null}
        matches={matchResources(inc, state.volunteers).slice(0, 4)}
        onClose={() => setShowMatch(false)}
        onAssign={(volunteerId: string) => {
          actions.assignVolunteer(inc.id, volunteerId);
          toast.success("Volunteer assigned, task created");
          setShowMatch(false);
        }}
      />
    </AppShell>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded border border-border bg-card p-2">
      <p className="text-[10px] tracking-widest text-muted-foreground uppercase">{k}</p>
      <p className="mt-0.5 text-sm font-semibold">{v}</p>
    </div>
  );
}
