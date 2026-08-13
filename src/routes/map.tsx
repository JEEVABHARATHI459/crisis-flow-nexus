import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/crisis/AppShell";
import { PageHeader, StatusBadge, UrgencyBadge } from "@/components/crisis/ui-bits";
import { Button } from "@/components/ui/button";
import { useCrisis } from "@/lib/crisis/store";
import { LOCATIONS } from "@/lib/crisis/seed";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/map")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Operations Map — CrisisMesh" },
      { name: "description", content: "Geospatial view of Chennai incidents, volunteers, resources and shelters." },
      { property: "og:title", content: "Operations Map — CrisisMesh" },
      { property: "og:description", content: "Live incident markers with filters and quick assignment." },
    ],
  }),
  component: MapPage,
});

const FILTERS = [
  "all",
  "critical",
  "high",
  "medical",
  "evacuation",
  "food",
  "water",
  "shelter",
  "volunteers",
  "resources",
  "unassigned",
] as const;

const BOUNDS = { minLat: 12.9, maxLat: 13.14, minLng: 80.1, maxLng: 80.29 };

function pos(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const y = (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
  return { left: `${Math.min(96, Math.max(3, x))}%`, top: `${Math.min(94, Math.max(4, y))}%` };
}

function MapPage() {
  const state = useCrisis();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const showIncidents = !["volunteers", "resources"].includes(filter);
  const showVolunteers = filter === "all" || filter === "volunteers";
  const showResources = filter === "all" || filter === "resources" || filter === "shelter";

  const incidents = useMemo(
    () =>
      state.incidents.filter((i) => {
        if (!showIncidents) return false;
        switch (filter) {
          case "all":
            return true;
          case "critical":
            return i.urgency === "critical";
          case "high":
            return i.urgency === "high";
          case "medical":
            return i.type === "Medical Emergency";
          case "evacuation":
            return i.type === "Evacuation" || i.type === "Rescue";
          case "food":
            return i.type === "Food Shortage";
          case "water":
            return i.type === "Water Shortage";
          case "shelter":
            return i.type === "Shelter Request";
          case "unassigned":
            return !i.assignedVolunteerId;
          default:
            return true;
        }
      }),
    [state.incidents, filter, showIncidents],
  );

  const sel = state.incidents.find((i) => i.id === selected);
  const selVol = sel ? state.volunteers.find((v) => v.id === sel.assignedVolunteerId) : undefined;

  const locOf = (name: string) => LOCATIONS.find((l) => l.name === name) ?? LOCATIONS[0]!;

  return (
    <AppShell>
      <PageHeader title="Operations Map" subtitle="Chennai flood response — demo coordinates." />

      <div className="mb-3 flex flex-wrap gap-2">
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel grid-bg relative h-[460px] overflow-hidden lg:col-span-2">
          {showIncidents
            ? incidents.map((i) => {
                const l = locOf(i.location);
                const color =
                  i.status === "resolved"
                    ? "bg-resolved"
                    : i.urgency === "critical"
                      ? "bg-critical"
                      : i.urgency === "high"
                        ? "bg-high"
                        : "bg-medium";
                return (
                  <button
                    key={i.id}
                    style={pos(l.lat + (Number(i.id.slice(-1)) || 0) * 0.002, l.lng)}
                    onClick={() => setSelected(i.id)}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    aria-label={`Incident ${i.id}`}
                  >
                    <span className={cn("live-dot block size-3.5 rounded-full ring-4 ring-black/30", color)} />
                  </button>
                );
              })
            : null}

          {showVolunteers
            ? state.volunteers.map((v) => {
                const l = locOf(v.location);
                return (
                  <span
                    key={v.id}
                    style={pos(l.lat - 0.004, l.lng + 0.004)}
                    title={`${v.name} (${v.team}) — ${v.status}`}
                    className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-ai bg-ai/40"
                  />
                );
              })
            : null}

          {showResources
            ? state.shelters.map((s) => (
                <span
                  key={s.id}
                  style={pos(s.lat + 0.005, s.lng - 0.005)}
                  title={`${s.name} — ${s.occupied}/${s.capacity}`}
                  className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-resolved bg-resolved/40"
                />
              ))
            : null}

          <div className="absolute bottom-3 left-3 rounded-md border border-border bg-panel/90 p-2 text-[10px] tracking-widest uppercase">
            <p className="flex items-center gap-1"><span className="size-2 rounded-full bg-critical" /> critical</p>
            <p className="flex items-center gap-1"><span className="size-2 rounded-full bg-high" /> high</p>
            <p className="flex items-center gap-1"><span className="size-2 rounded-full bg-medium" /> medium</p>
            <p className="flex items-center gap-1"><span className="size-2 rounded-full bg-resolved" /> resolved</p>
          </div>
        </div>

        <div className="panel p-4">
          {sel ? (
            <>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold">{sel.id}</span>
                <UrgencyBadge urgency={sel.urgency} />
              </div>
              <h3 className="mt-2 font-semibold">{sel.type}</h3>
              <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>Location: <span className="text-foreground">{sel.location}</span></p>
                <p>Affected: <span className="text-foreground">{sel.affectedPeople}</span></p>
                <p>Resource: <span className="text-foreground">{sel.requiredResource}</span></p>
                <p>Team: <span className="text-foreground">{selVol ? `${selVol.name} (${selVol.team})` : "Unassigned"}</span></p>
              </dl>
              <div className="mt-2">
                <StatusBadge status={sel.status} />
              </div>
              <Button className="mt-4 w-full" onClick={() => navigate({ to: "/incidents/$id", params: { id: sel.id } })}>
                VIEW INCIDENT
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Showing {incidents.length} incident markers. Click a marker to inspect it.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
