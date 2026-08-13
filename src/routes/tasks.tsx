import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/crisis/AppShell";
import { PageHeader, UrgencyBadge, clock } from "@/components/crisis/ui-bits";
import { Button } from "@/components/ui/button";
import { actions, useCrisis } from "@/lib/crisis/store";
import type { TaskStatus } from "@/lib/crisis/types";

export const Route = createFileRoute("/tasks")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Task Board — CrisisMesh" },
      { name: "description", content: "Kanban board of dispatched relief tasks from pending to completed." },
      { property: "og:title", content: "Task Board — CrisisMesh" },
      { property: "og:description", content: "Move tasks through acceptance, transit, on-site and completion." },
    ],
  }),
  component: TasksPage,
});

const COLUMNS: { key: TaskStatus; label: string; next?: TaskStatus }[] = [
  { key: "pending", label: "Pending", next: "accepted" },
  { key: "accepted", label: "Accepted", next: "in_transit" },
  { key: "in_transit", label: "In Transit", next: "on_site" },
  { key: "on_site", label: "On Site", next: "completed" },
  { key: "completed", label: "Completed" },
];

function TasksPage() {
  const state = useCrisis();
  const navigate = useNavigate();

  return (
    <AppShell>
      <PageHeader title="Task Board" subtitle={`${state.tasks.length} dispatched tasks across the response.`} />

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {COLUMNS.map((col) => {
          const items = state.tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="panel flex flex-col p-3">
              <h2 className="flex items-center justify-between text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                {col.label}
                <span className="rounded-full border border-border px-2 font-mono text-[10px]">{items.length}</span>
              </h2>
              <div className="mt-3 space-y-2">
                {items.map((t) => {
                  const v = state.volunteers.find((x) => x.id === t.assigneeId);
                  return (
                    <div key={t.id} className="rounded-md border border-border bg-card p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold">{t.id}</span>
                        <span className="ml-auto">
                          <UrgencyBadge urgency={t.urgency} />
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs">{t.description}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {t.location} • {v ? v.name : "Unassigned"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {t.completedAt ? `Completed ${clock(t.completedAt)}` : `Created ${clock(t.createdAt)}`}
                      </p>
                      <div className="mt-2 flex gap-1.5">
                        {col.next ? (
                          <Button
                            size="sm"
                            className="h-7 text-[10px]"
                            onClick={() => {
                              actions.setTaskStatus(t.id, col.next!);
                              toast.success(`${t.id} → ${col.next!.replace("_", " ").toUpperCase()}`);
                            }}
                          >
                            {col.next.replace("_", " ").toUpperCase()}
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px]"
                          onClick={() => navigate({ to: "/incidents/$id", params: { id: t.incidentId } })}
                        >
                          INCIDENT
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 ? <p className="py-6 text-center text-[11px] text-muted-foreground">Empty</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
