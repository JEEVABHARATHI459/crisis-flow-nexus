import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { actions, hydrateStore, useCrisis, useHydrated } from "@/lib/crisis/store";
import { DEMO_USER } from "@/lib/crisis/credentials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — CrisisMesh Crisis Coordination" },
      { name: "description", content: "Sign in to CrisisMesh to coordinate AI-assisted emergency response operations." },
      { property: "og:title", content: "Sign in — CrisisMesh" },
      { property: "og:description", content: "AI-assisted crisis intelligence for faster humanitarian response." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const state = useCrisis();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_USER.email);
  const [password, setPassword] = useState(DEMO_USER.password);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    hydrateStore();
  }, []);

  useEffect(() => {
    if (hydrated && state.session) navigate({ to: "/dashboard" });
  }, [hydrated, state.session, navigate]);

  function signIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Email is required.");
    if (!password) return setError("Password is required.");
    setBusy(true);
    const res = actions.login(email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success("Signed in to CrisisMesh");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="grid-bg relative hidden flex-col justify-between border-r border-border bg-panel p-10 lg:flex">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-md bg-ai/15 text-ai">
            <Activity className="size-5" />
          </span>
          <span className="font-mono text-lg font-bold tracking-[0.24em]">CRISISMESH</span>
        </div>
        <div>
          <h1 className="max-w-md text-4xl leading-tight font-bold tracking-tight">TURN CHAOS INTO COORDINATION.</h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            AI-assisted crisis intelligence for faster, smarter humanitarian response.
          </p>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
            {[
              ["30", "Reports"],
              ["15", "Incidents"],
              ["10", "Volunteers"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-lg border border-border bg-card p-3">
                <p className="font-mono text-2xl font-bold text-ai">{v}</p>
                <p className="text-[10px] tracking-widest text-muted-foreground uppercase">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="max-w-md text-xs text-muted-foreground">
          CrisisMesh is an AI-assisted coordination prototype. It does not replace emergency services, trained responders, or
          official authorities.
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={signIn} className="panel w-full max-w-sm p-6">
          <div className="mb-6 lg:hidden">
            <span className="font-mono text-lg font-bold tracking-[0.24em]">CRISISMESH</span>
            <p className="mt-2 text-sm font-semibold">TURN CHAOS INTO COORDINATION.</p>
          </div>
          <h2 className="text-sm font-semibold tracking-[0.2em] uppercase">Operator sign in</h2>
          <p className="mt-1 mb-5 text-xs text-muted-foreground">Emergency Response Team access</p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-card" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 bg-card"
              />
            </div>
            {error ? <p className="text-xs text-critical">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={busy}>
              SIGN IN
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                actions.demoLogin();
                toast.success("Demo session started");
                navigate({ to: "/dashboard" });
              }}
            >
              ENTER DEMO MODE
            </Button>
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-resolved" />
            <span>
              Sign-in credentials — <span className="font-mono text-foreground">{DEMO_USER.email}</span> /{" "}
              <span className="font-mono text-foreground">{DEMO_USER.password}</span>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
