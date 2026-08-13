import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/crisis/AppShell";
import { PageHeader } from "@/components/crisis/ui-bits";
import { Button } from "@/components/ui/button";
import { actions, useCrisis } from "@/lib/crisis/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resources")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Resources — CrisisMesh" },
      { name: "description", content: "Track medical supplies, water, food, vehicles, shelters and rescue equipment." },
      { property: "og:title", content: "Resources — CrisisMesh" },
      { property: "og:description", content: "Reserve, release and update relief stock in real time." },
    ],
  }),
  component: ResourcesPage,
});

const CATS = ["All", "Medical", "Water", "Food", "Vehicle", "Shelter", "Rescue"] as const;

function ResourcesPage() {
  const state = useCrisis();
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [qty, setQty] = useState<Record<string, string>>({});

  const list = state.resources.filter((r) => cat === "All" || r.category === cat);

  return (
    <AppShell>
      <PageHeader title="Resources" subtitle="Live relief inventory across depots and shelters." />

      <div className="mb-4 flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-widest uppercase",
              cat === c ? "border-ai/50 bg-ai/10 text-ai" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((r) => {
          const n = Number(qty[r.id] ?? "") || 1;
          return (
            <div key={r.id} className="panel rise p-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-wide uppercase">{r.name}</span>
                <span
                  className={cn(
                    "ml-auto rounded-full border px-2 py-0.5 text-[10px] tracking-widest uppercase",
                    r.available > 0
                      ? "border-resolved/40 bg-resolved/10 text-resolved"
                      : "border-critical/40 bg-critical/10 text-critical",
                  )}
                >
                  {r.available > 0 ? "Available" : "Depleted"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {r.category} • {r.location}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <p className="rounded border border-border bg-card p-2">
                  <span className="text-[10px] tracking-widest text-muted-foreground uppercase">Available</span>
                  <br />
                  <span className="font-mono text-lg font-bold">{r.available}</span> <span className="text-xs">{r.unit}</span>
                </p>
                <p className="rounded border border-border bg-card p-2">
                  <span className="text-[10px] tracking-widest text-muted-foreground uppercase">Reserved</span>
                  <br />
                  <span className="font-mono text-lg font-bold text-high">{r.reserved}</span>
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={qty[r.id] ?? ""}
                  onChange={(e) => setQty((q) => ({ ...q, [r.id]: e.target.value }))}
                  placeholder="qty"
                  className="h-8 w-20 rounded-md border border-border bg-card px-2 text-xs"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (r.available < n) return void toast.error("Not enough stock available");
                    actions.reserveResource(r.id, n);
                    toast.success(`Reserved ${n} ${r.unit} of ${r.name}`);
                  }}
                >
                  Reserve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (r.reserved < n) return void toast.error("Nothing reserved to release");
                    actions.releaseResource(r.id, n);
                    toast.success(`Released ${n} ${r.unit}`);
                  }}
                >
                  Release
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    actions.updateResourceQuantity(r.id, r.available + n);
                    toast.success(`${r.name} stock updated`);
                  }}
                >
                  + Stock
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
