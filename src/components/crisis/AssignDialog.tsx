import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Match } from "@/lib/crisis/ai";
import type { Incident } from "@/lib/crisis/types";
import { UrgencyBadge } from "./ui-bits";

export function AssignDialog({
  incident,
  matches,
  onClose,
  onAssign,
}: {
  incident: Incident | null;
  matches: Match[];
  onClose: () => void;
  onAssign: (volunteerId: string) => void;
}) {
  const [confirm, setConfirm] = useState<Match | null>(null);

  return (
    <Dialog
      open={Boolean(incident)}
      onOpenChange={(o) => {
        if (!o) {
          setConfirm(null);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        {incident ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-mono">
                {incident.id} <UrgencyBadge urgency={incident.urgency} />
              </DialogTitle>
              <DialogDescription>
                {incident.type} • {incident.location} • needs {incident.requiredResource}
              </DialogDescription>
            </DialogHeader>

            {confirm ? (
              <div className="space-y-4">
                <p className="rounded-md border border-ai/40 bg-ai/10 p-3 text-sm">
                  Assign <strong>{confirm.volunteer.name}</strong> ({confirm.volunteer.team}) to {incident.id}?
                </p>
                <p className="text-xs text-muted-foreground">
                  This is an AI-assisted recommendation and requires human verification. Confirming will create a task,
                  mark the volunteer busy, notify the team, and write an audit log.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setConfirm(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => onAssign(confirm.volunteer.id)}>Confirm assignment</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
                  AI recommendation — human approval required
                </p>
                {matches.length === 0 ? <p className="text-sm text-muted-foreground">No volunteers online.</p> : null}
                {matches.map((m) => (
                  <div key={m.volunteer.id} className="rounded-md border border-border bg-card p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{m.volunteer.team}</span>
                      <span className="text-xs text-muted-foreground">{m.volunteer.name}</span>
                      <span className="ml-auto font-mono text-sm font-bold text-ai">{m.score}%</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{m.reasons.join(" • ")}</p>
                    <Button size="sm" className="mt-2" onClick={() => setConfirm(m)}>
                      ASSIGN
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
