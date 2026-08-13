import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/crisis/AppShell";
import { PageHeader, SafetyNote } from "@/components/crisis/ui-bits";
import { Button } from "@/components/ui/button";
import { actions, useCrisis } from "@/lib/crisis/store";
import type { Lang } from "@/lib/crisis/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ta", label: "தமிழ்" },
  { code: "hi", label: "हिन्दी" },
];
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Settings — CrisisMesh" },
      { name: "description", content: "Language, session, demo data reset and export for the CrisisMesh coordination console." },
      { property: "og:title", content: "Settings — CrisisMesh" },
      { property: "og:description", content: "Manage your coordinator session and operational data." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const state = useCrisis();
  const navigate = useNavigate();

  function exportAll() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crisismesh-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Operational dataset exported");
  }

  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Session, language and demo data management." />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-4">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Coordinator</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <p>Name: <span className="font-semibold">{state.session?.name ?? "—"}</span></p>
            <p>Email: <span className="font-mono">{state.session?.email ?? "—"}</span></p>
            <p>Role: {state.session?.role ?? "—"}</p>
            <p>Mode: {state.session?.demo ? "Demo session" : "Standard session"}</p>
          </dl>
          <Button
            variant="destructive"
            className="mt-4"
            onClick={() => {
              actions.logout();
              navigate({ to: "/login" });
            }}
          >
            SIGN OUT
          </Button>
        </section>

        <section className="panel p-4">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Language</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Interface labels switch instantly. Report intake understands English, Tamil and Hindi regardless of this setting.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  actions.setLanguage(l.code);
                  toast.success(`Language set to ${l.label}`);
                }}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-semibold",
                  state.language === l.code
                    ? "border-ai/50 bg-ai/10 text-ai"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>

        <section className="panel p-4">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Data</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            All state is stored locally in this browser. Reset restores the original Chennai flood scenario.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded border border-border bg-card px-2 py-1">{state.reports.length} reports</span>
            <span className="rounded border border-border bg-card px-2 py-1">{state.incidents.length} incidents</span>
            <span className="rounded border border-border bg-card px-2 py-1">{state.volunteers.length} volunteers</span>
            <span className="rounded border border-border bg-card px-2 py-1">{state.tasks.length} tasks</span>
            <span className="rounded border border-border bg-card px-2 py-1">{state.audit.length} audit events</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={exportAll}>EXPORT DATA</Button>
            <Button
              variant="outline"
              onClick={() => {
                actions.resetData();
                toast.success("Demo scenario restored");
              }}
            >
              RESET DEMO DATA
            </Button>
          </div>
        </section>

        <section className="panel p-4">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">About CrisisMesh</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            CrisisMesh is an AI-assisted disaster coordination console. It ingests multi-channel reports, deduplicates them into
            incidents, scores urgency, and recommends the nearest capable responder — always with a human in the loop.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Prototype build • demo dataset • not for live emergency use.</p>
        </section>
      </div>

      <SafetyNote />
    </AppShell>
  );
}
