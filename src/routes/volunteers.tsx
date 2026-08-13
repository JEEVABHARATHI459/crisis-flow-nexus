import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/crisis/AppShell";
import { EmptyState, PageHeader } from "@/components/crisis/ui-bits";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCrisis } from "@/lib/crisis/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/volunteers")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Volunteers — CrisisMesh" },
      { name: "description", content: "Volunteer roster with skills, distance, availability and current assignments." },
      { property: "og:title", content: "Volunteers — CrisisMesh" },
      { property: "og:description", content: "Who is available, who is busy, and who is closest." },
    ],
  }),
  component: VolunteersPage,
});

const FILTERS = ["all", "available", "busy", "offline", "medical", "transport", "rescue"] as const;

function VolunteersPage() {
  const state = useCrisis();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = state.volunteers.filter((v) => {
    if (filter === "all") return true;
    if (["available", "busy", "offline"].includes(filter)) return v.status === filter;
    const skills = v.skills.join(" ").toLowerCase();
    if (filter === "medical") return skills.includes("medical") || skills.includes("first aid");
    if (filter === "transport") return skills.includes("transport") || skills.includes("driving");
    return skills.includes("rescue") || skills.includes("swimming") || skills.includes("boat");
  });

  const vol = state.volunteers.find((v) => v.id === openId);
  const task = vol ? state.tasks.find((t) => t.id === vol.currentTaskId) : undefined;

  return (
    <AppShell>
      <PageHeader title="Volunteers" subtitle={`${state.volunteers.length} responders in the roster.`} />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-widest uppercase",
              filter === f ? "border-ai/50 bg-ai/10 text-ai" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState title="No volunteers match this filter" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((v) => (
            <button key={v.id} onClick={() => setOpenId(v.id)} className="panel rise p-4 text-left hover:border-ai/50">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{v.name}</span>
                <span
                  className={cn(
                    "ml-auto rounded-full border px-2 py-0.5 text-[10px] tracking-widest uppercase",
                    v.status === "available"
                      ? "border-resolved/40 bg-resolved/10 text-resolved"
                      : v.status === "busy"
                        ? "border-high/40 bg-high/10 text-high"
                        : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {v.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{v.team}</p>
              <p className="mt-2 text-xs">{v.skills.join(" • ")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {v.location} • {v.distanceKm} km away • {v.completed} tasks completed
              </p>
            </button>
          ))}
        </div>
      )}

      <Dialog open={Boolean(vol)} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent>
          {vol ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {vol.name} — {vol.team}
                </DialogTitle>
              </DialogHeader>
              <dl className="space-y-1 text-sm">
                <p>Status: <span className="font-semibold uppercase">{vol.status}</span></p>
                <p>Skills: {vol.skills.join(", ")}</p>
                <p>Location: {vol.location} ({vol.distanceKm} km)</p>
                <p>Phone: <span className="font-mono">{vol.phone}</span></p>
                <p>Completed tasks: {vol.completed}</p>
                <p>Current task: {task ? `${task.id} — ${task.description}` : "None"}</p>
              </dl>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
