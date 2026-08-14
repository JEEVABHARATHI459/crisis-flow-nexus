import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  Brain,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  Menu,
  ScrollText,
  Search,
  Settings as SettingsIcon,
  Users,
  X,
} from "lucide-react";
import { actions, hydrateStore, useCrisis } from "@/lib/crisis/store";
import { t, type TKey } from "@/lib/crisis/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NAV: { to: string; key: TKey; icon: typeof LayoutDashboard }[] = [
  { to: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { to: "/incidents", key: "incidents", icon: AlertTriangle },
  { to: "/reports", key: "reports", icon: Inbox },
  { to: "/ai-processing", key: "ai", icon: Brain },
  { to: "/map", key: "map", icon: MapIcon },
  { to: "/volunteers", key: "volunteers", icon: Users },
  { to: "/resources", key: "resources", icon: Boxes },
  { to: "/tasks", key: "tasks", icon: ClipboardList },
  { to: "/analytics", key: "analytics", icon: BarChart3 },
  { to: "/audit", key: "audit", icon: ScrollText },
  { to: "/settings", key: "settings", icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const state = useCrisis();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");
  const lang = state.language;

  useEffect(() => {
    hydrateStore();
  }, []);

  useEffect(() => {
    if (!state.session) navigate({ to: "/login" });
  }, [state.session, navigate]);

  useEffect(() => {
    setOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  const unread = state.notifications.filter((n) => !n.read).length;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const inc = state.incidents
      .filter((i) => `${i.id} ${i.type} ${i.location}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map((i) => ({ label: `${i.id} — ${i.type}`, to: `/incidents/${i.id}` }));
    const vol = state.volunteers
      .filter((v) => `${v.name} ${v.team}`.toLowerCase().includes(q))
      .slice(0, 3)
      .map((v) => ({ label: `${v.name} — ${v.team}`, to: `/volunteers` }));
    const rep = state.reports
      .filter((r) => `${r.id} ${r.message}`.toLowerCase().includes(q))
      .slice(0, 3)
      .map((r) => ({ label: `${r.id} — ${r.message.slice(0, 40)}…`, to: `/reports` }));
    return [...inc, ...vol, ...rep];
  }, [query, state.incidents, state.volunteers, state.reports]);

  if (!state.session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Activity className="size-5 animate-pulse text-ai" />
          <span className="font-mono text-sm tracking-widest uppercase">Loading CrisisMesh…</span>
        </div>
      </div>
    );
  }

  const sidebar = (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-panel">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md bg-ai/15 text-ai">
            <Activity className="size-4" />
          </span>
          <span className="font-mono text-sm font-bold tracking-[0.2em]">CRISISMESH</span>
        </Link>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="size-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-ai/10 font-semibold text-ai shadow-[inset_2px_0_0_0_var(--ai)]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {t(lang, item.key)}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {t(lang, "systemStatus")}
        </p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {[t(lang, "aiEngine"), t(lang, "dbConnected"), t(lang, "mapServices")].map((s) => (
            <li key={s} className="flex items-center gap-2">
              <span className="live-dot size-1.5 rounded-full bg-resolved" />
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-3 rounded-md border border-border bg-card p-2">
          <p className="text-xs font-semibold">{state.session.name}</p>
          <p className="text-[11px] text-muted-foreground">{state.session.role}</p>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex">{sidebar}</div>
      {open ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative">{sidebar}</div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex flex-wrap items-center gap-3 border-b border-border bg-panel/95 px-4 py-3 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-[0.16em] sm:text-sm">
              CHENNAI FLOOD RESPONSE — 2026
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-critical/40 bg-critical/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-critical">
              <span className="live-dot size-1.5 rounded-full bg-critical" /> LIVE
            </span>
          </div>

          <div className="relative order-last w-full sm:order-none sm:ml-auto sm:w-72">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(lang, "search")}
              className="h-9 bg-card pl-8"
            />
            {results.length > 0 ? (
              <div className="absolute top-11 z-50 w-full overflow-hidden rounded-md border border-border bg-popover shadow-xl">
                {results.map((r) => (
                  <button
                    key={r.label}
                    className="block w-full px-3 py-2 text-left text-xs hover:bg-accent"
                    onClick={() => {
                      setQuery("");
                      navigate({ to: r.to });
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative grid size-9 place-items-center rounded-md border border-border bg-card hover:bg-accent"
              aria-label={t(lang, "notifications")}
            >
              <Bell className="size-4" />
              {unread > 0 ? (
                <span className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full bg-critical px-1 font-mono text-[10px] font-bold text-white">
                  {unread}
                </span>
              ) : null}
            </button>
            {notifOpen ? (
              <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-popover shadow-2xl">
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <span className="text-xs font-semibold tracking-widest uppercase">{t(lang, "notifications")}</span>
                  <button className="text-[11px] text-ai hover:underline" onClick={() => actions.markAllRead()}>
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {state.notifications.slice(0, 12).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        actions.markNotificationRead(n.id);
                        setNotifOpen(false);
                        if (n.link) navigate({ to: n.link });
                      }}
                      className={cn(
                        "block w-full border-b border-border/60 px-3 py-2 text-left hover:bg-accent",
                        !n.read && "bg-ai/5",
                      )}
                    >
                      <p className="text-xs font-semibold">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground">{n.body}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="text-right">
              <p className="text-xs font-semibold">{state.session.name}</p>
              <p className="text-[10px] text-muted-foreground">{state.session.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              actions.logout();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="size-4" /> <span className="hidden sm:inline">{t(lang, "logout")}</span>
          </Button>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
