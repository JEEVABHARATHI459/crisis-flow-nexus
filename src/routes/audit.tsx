import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/crisis/AppShell";
import { EmptyState, PageHeader, clock } from "@/components/crisis/ui-bits";
import { Button } from "@/components/ui/button";
import { useCrisis } from "@/lib/crisis/store";
import type { AuditLog } from "@/lib/crisis/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/audit")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Audit Trail — CrisisMesh" },
      { name: "description", content: "Complete, exportable log of every AI decision and human action in the response." },
      { property: "og:title", content: "Audit Trail — CrisisMesh" },
      { property: "og:description", content: "Transparent accountability for AI-assisted crisis coordination." },
    ],
  }),
  component: AuditPage,
});

const CATS: (AuditLog["category"] | "all")[] = ["all", "ai", "human", "assignment", "status", "priority", "report"];

function AuditPage() {
  const state = useCrisis();
  const [cat, setCat] = useState<(typeof CATS)[number]>("all");
  const [q, setQ] = useState("");

  const rows = state.audit.filter((a) => {
    if (cat !== "all" && a.category !== cat) return false;
    if (!q.trim()) return true;
    const t = `${a.action} ${a.entity} ${a.details} ${a.actor}`.toLowerCase();
    return t.includes(q.trim().toLowerCase());
  });

  function exportJson() {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crisismesh-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} audit entries`);
  }

  return (
    <AppShell>
      <PageHeader
        title="Audit Trail"
        subtitle={`${state.audit.length} recorded events — every AI inference and human override.`}
        actions={<Button onClick={exportJson}>EXPORT JSON</Button>}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
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
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search actions, entities, details..."
          className="ml-auto h-9 w-full max-w-xs rounded-md border border-border bg-card px-3 text-xs"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No audit entries match" hint="Try a different category or search term." />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border text-[10px] tracking-widest text-muted-foreground uppercase">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 300).map((a) => (
                <tr key={a.id} className="border-b border-border/50 last:border-0">
                  <td className="p-3 font-mono whitespace-nowrap text-muted-foreground">{clock(a.ts)}</td>
                  <td className="p-3 font-semibold text-ai">{a.action}</td>
                  <td className="p-3 font-mono">{a.entity}</td>
                  <td className="p-3">{a.actor}</td>
                  <td className="p-3 font-mono">{a.confidence === null ? "—" : `${Math.round(a.confidence * 100)}%`}</td>
                  <td className="p-3 text-muted-foreground">{a.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
