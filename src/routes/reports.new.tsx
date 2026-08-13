import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/crisis/AppShell";
import { PageHeader, SafetyNote } from "@/components/crisis/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { actions } from "@/lib/crisis/store";
import type { Source } from "@/lib/crisis/types";

export const Route = createFileRoute("/reports/new")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Add Emergency Report — CrisisMesh" },
      { name: "description", content: "Submit a new emergency report and process it with the CrisisMesh AI pipeline." },
      { property: "og:title", content: "Add Emergency Report — CrisisMesh" },
      { property: "og:description", content: "Turn a messy message into a structured, prioritised incident." },
    ],
  }),
  component: NewReportPage,
});

const SOURCES: { value: Source; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "sms", label: "SMS" },
  { value: "social", label: "Social Media" },
  { value: "voice", label: "Voice Transcript" },
  { value: "manual", label: "Manual" },
];

const SAMPLES = [
  "Need insulin near central bus stand. Diabetic patient stranded.",
  "சென்ட்ரல் பஸ் ஸ்டாண்டுக்கு அருகில் இன்சுலின் தேவை. சர்க்கரை நோயாளி ஒருவர் சிக்கியுள்ளார்.",
  "No drinking water in Anna Nagar for 60 families, send tanker urgently.",
];

function NewReportPage() {
  const navigate = useNavigate();
  const [source, setSource] = useState<Source>("whatsapp");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [people, setPeople] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 8) {
      setError("Please describe the emergency (at least 8 characters).");
      return;
    }
    setError("");
    setBusy(true);
    const res = actions.addReport({
      source,
      message: message.trim(),
      location: location.trim(),
      affectedPeople: people ? Number(people) : 0,
    });
    await new Promise((r) => setTimeout(r, 600));
    toast.success(
      res.duplicate
        ? `Duplicate detected — merged into ${res.incidentId}`
        : `New incident ${res.incidentId} created`,
    );
    navigate({ to: "/ai-processing" });
  }

  return (
    <AppShell>
      <PageHeader title="Add Emergency Report" subtitle="Every submission runs through the full CrisisMesh pipeline." />

      <form onSubmit={submit} className="panel max-w-2xl space-y-4 p-5">
        <div>
          <Label htmlFor="source">Source</Label>
          <select
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value as Source)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="message">Emergency message</Label>
          <Textarea
            id="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste the WhatsApp / SMS / voice-note text here. Tamil and Hindi are supported."
            className="mt-1 bg-card"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {SAMPLES.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMessage(s)}
                className="rounded border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                Sample {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="loc">Location (optional)</Label>
            <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 bg-card" placeholder="e.g. Central Bus Stand" />
          </div>
          <div>
            <Label htmlFor="people">Affected people (optional)</Label>
            <Input
              id="people"
              type="number"
              min={0}
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              className="mt-1 bg-card"
            />
          </div>
        </div>

        {error ? <p className="text-xs text-critical">{error}</p> : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? "PROCESSING…" : "PROCESS WITH CRISISMESH AI"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/reports" })}>
            Cancel
          </Button>
        </div>
      </form>

      <SafetyNote />
    </AppShell>
  );
}
