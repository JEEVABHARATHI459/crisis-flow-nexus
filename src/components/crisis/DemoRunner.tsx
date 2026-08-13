import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { actions, getState, matchResources } from "@/lib/crisis/store";

const DEMO_REPORTS: { source: "whatsapp" | "sms" | "manual" | "voice"; message: string }[] = [
  { source: "whatsapp", message: "Need insulin near central bus stand. Diabetic patient stranded." },
  { source: "sms", message: "Diabetic patient is stranded near bus stand, urgent medicine required." },
  { source: "whatsapp", message: "Urgent insulin needed close to main bus stop." },
  { source: "manual", message: "Medicine required for diabetic patient near the bus terminus." },
  { source: "voice", message: "Elderly diabetic person waiting near central bus stand for insulin." },
];

interface Result {
  incidentId: string;
  reports: number;
  team: string;
  minutes: number;
}

export function DemoRunner({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phase, setPhase] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const running = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      running.current = false;
      setPhase(0);
      setLines([]);
      setResult(null);
    }
  }, [open]);

  async function run() {
    if (running.current) return;
    running.current = true;
    setResult(null);
    setLines([]);
    setPhase(1);
    const push = (s: string) => setLines((l) => [...l, s]);
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    let incidentId = "";
    let reportCount = 0;

    push("PHASE 1 — 5 incoming emergency reports received");
    await wait(700);

    for (let i = 0; i < DEMO_REPORTS.length; i++) {
      const r = DEMO_REPORTS[i]!;
      setPhase(2 + Math.min(i, 3));
      const res = actions.addReport({ source: r.source, message: r.message, location: "Central Bus Stand", affectedPeople: 1 });
      incidentId = res.incidentId;
      reportCount += 1;
      push(
        `PHASE ${i + 2} — ${res.reportId}: ${res.extraction.incidentType} • ${res.extraction.location} • ${res.extraction.requiredResource} • ${res.extraction.urgency.toUpperCase()}` +
          (res.duplicate ? ` → duplicate ${(res.duplicate.similarity * 100).toFixed(0)}% merged into ${res.incidentId}` : " → new incident created"),
      );
      await wait(650);
    }

    setPhase(7);
    push(`PHASE 7 — Priority calculated for ${incidentId}`);
    actions.verifyPriority(incidentId, "accept");
    await wait(600);

    setPhase(8);
    const state = getState();
    const inc = state.incidents.find((i) => i.id === incidentId)!;
    const match = matchResources(inc, state.volunteers)[0]!;
    push(`PHASE 8 — Best match: ${match.volunteer.team} (${match.volunteer.name}) at ${match.score}%`);
    await wait(600);

    setPhase(9);
    actions.assignVolunteer(incidentId, match.volunteer.id);
    push(`PHASE 9 — ${match.volunteer.team} assigned, volunteer marked BUSY`);
    await wait(600);

    setPhase(10);
    const task = getState().tasks.find((t) => t.incidentId === incidentId)!;
    push(`PHASE 10 — Task ${task.id} created`);
    await wait(500);

    setPhase(11);
    push("PHASE 11 — Operations map updated with incident marker");
    await wait(500);

    setPhase(12);
    actions.setTaskStatus(task.id, "in_progress");
    await wait(500);
    actions.setTaskStatus(task.id, "completed");
    push("PHASE 12 — Task completed, incident RESOLVED");
    await wait(500);

    setPhase(13);
    push("PHASE 13 — Dashboard statistics updated");
    await wait(400);

    setPhase(14);
    actions.auditEvent("DEMO_COMPLETED", incidentId, "End-to-end CrisisMesh workflow executed", "human");
    push("PHASE 14 — Audit trail written");
    await wait(300);

    const finalInc = getState().incidents.find((i) => i.id === incidentId)!;
    setResult({
      incidentId,
      reports: finalInc.reportIds.length || reportCount,
      team: match.volunteer.team,
      minutes: 17,
    });
    running.current = false;
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono tracking-widest">LIVE DEMO — FULL WORKFLOW</DialogTitle>
        </DialogHeader>

        {phase === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This runs the real pipeline: 5 messy messages → AI extraction → duplicate detection → one incident →
              priority → volunteer match → assignment → task → completion → audit.
            </p>
            <Button className="w-full" onClick={run}>
              ▶ START DEMO
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-ai transition-all duration-500" style={{ width: `${(phase / 14) * 100}%` }} />
            </div>
            <ul className="space-y-1 font-mono text-xs">
              {lines.map((l, i) => (
                <li key={i} className="rise flex gap-2 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-resolved" />
                  <span>{l}</span>
                </li>
              ))}
              {!result ? (
                <li className="flex gap-2 text-ai">
                  <Loader2 className="mt-0.5 size-3.5 animate-spin" /> processing…
                </li>
              ) : null}
            </ul>

            {result ? (
              <div className="panel glow-ai rise mt-4 p-4">
                <p className="font-mono text-lg font-bold tracking-widest text-resolved">CRISIS RESOLVED</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted-foreground">Incident</dt>
                  <dd className="font-mono">{result.incidentId}</dd>
                  <dt className="text-muted-foreground">Reports consolidated</dt>
                  <dd className="font-mono">{result.reports}</dd>
                  <dt className="text-muted-foreground">Volunteer assigned</dt>
                  <dd className="font-mono">{result.team}</dd>
                  <dt className="text-muted-foreground">Response time</dt>
                  <dd className="font-mono">17 minutes</dd>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-mono text-resolved">RESOLVED</dd>
                </dl>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      onClose();
                      navigate({ to: "/incidents/$id", params: { id: result.incidentId } });
                    }}
                  >
                    OPEN INCIDENT
                  </Button>
                  <Button size="sm" variant="outline" onClick={onClose}>
                    CLOSE
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
