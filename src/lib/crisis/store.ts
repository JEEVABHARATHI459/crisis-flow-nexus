import { useSyncExternalStore } from "react";
import { buildSeed } from "./seed";
import { extract, matchResources, priority } from "./ai";
import type {
  AuditLog,
  CrisisState,
  Incident,
  IncidentStatus,
  Notification,
  Report,
  Source,
  Task,
  TaskStatus,
  Urgency,
} from "./types";

const KEY = "crisismesh.state.v1";

let state: CrisisState = buildSeed();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

function set(updater: (s: CrisisState) => CrisisState) {
  state = updater(state);
  persist();
  emit();
}

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CrisisState;
      if (parsed && Array.isArray(parsed.reports)) state = { ...buildSeed(), ...parsed };
    }
  } catch {
    /* ignore corrupt state */
  }
  emit();
}

export function isHydrated() {
  return hydrated;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const getSnapshot = () => state;

export function useCrisis(): CrisisState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => hydrated,
    () => false,
  );
}

/* ---------------- helpers ---------------- */

let counter = 0;
const uid = (p: string) => `${p}${Date.now().toString(36).slice(-5)}${(counter++).toString(36)}`.toUpperCase();

function log(
  s: CrisisState,
  action: string,
  entity: string,
  actor: AuditLog["actor"],
  confidence: number | null,
  details: string,
  category: AuditLog["category"],
): CrisisState {
  const entry: AuditLog = {
    id: uid("A"),
    ts: new Date().toISOString(),
    action,
    entity,
    actor,
    confidence,
    details,
    category,
  };
  return { ...s, audit: [entry, ...s.audit] };
}

function notify(s: CrisisState, title: string, body: string, level: Urgency, link: string | null): CrisisState {
  const n: Notification = {
    id: uid("N"),
    title,
    body,
    level,
    link,
    ts: new Date().toISOString(),
    read: false,
  };
  return { ...s, notifications: [n, ...s.notifications] };
}

export const actions = {
  /* ------- auth ------- */
  login(email: string, password: string) {
    const user = findUser(email, password);
    if (!user) {
      return {
        ok: false as const,
        error: `Invalid credentials. Use ${DEMO_USER.email} / ${DEMO_USER.password}.`,
      };
    }
    set((s) =>
      log(
        { ...s, session: { email: user.email, name: user.name, role: user.role, demo: false } },
        "USER_LOGIN",
        user.email,
        "Coordinator",
        null,
        "Coordinator signed in",
        "human",
      ),
    );
    return { ok: true as const };
  },
  demoLogin() {
    set((s) =>
      log(
        {
          ...s,
          session: { email: DEMO_USER.email, name: DEMO_USER.name, role: DEMO_USER.role, demo: true },
        },
        "DEMO_SESSION_STARTED",
        DEMO_USER.email,
        "Coordinator",
        null,
        "Demo mode session created",
        "human",
      ),
    );
  },

  logout() {
    set((s) => log({ ...s, session: null }, "USER_LOGOUT", "session", "Coordinator", null, "Coordinator signed out", "human"));
  },
  setLanguage(language: CrisisState["language"]) {
    set((s) => ({ ...s, language }));
  },
  resetData() {
    set(() => ({ ...buildSeed(), session: state.session, language: state.language }));
  },

  /* ------- reports & AI pipeline ------- */
  addReport(input: { source: Source; message: string; location?: string; affectedPeople?: number }) {
    const ex = extract(input.message, state.incidents, {
      location: input.location ?? "",
      affectedPeople: input.affectedPeople ?? 0,
    });
    const reportId = uid("R");
    const now = new Date().toISOString();
    const dup = ex.duplicateCandidates[0] ?? null;

    const report: Report = {
      id: reportId,
      source: input.source,
      message: input.message,
      language: ex.language,
      location: ex.location,
      affectedPeople: ex.affectedPeople,
      status: "pending",
      urgency: ex.urgency,
      incidentId: null,
      createdAt: now,
    };

    let incidentId = dup?.incidentId ?? uid("INC-");

    set((s) => {
      let next: CrisisState = { ...s, reports: [report, ...s.reports] };
      next = log(next, "REPORT_RECEIVED", reportId, "System", null, `${input.source.toUpperCase()} report ingested`, "report");
      next = log(next, "TEXT_NORMALIZED", reportId, "AI", 0.99, "Message normalized and tokenized", "ai");
      next = log(next, "ENTITY_EXTRACTED", reportId, "AI", ex.confidence, `${ex.incidentType} • ${ex.requiredResource}`, "ai");
      next = log(next, "LOCATION_EXTRACTED", reportId, "AI", ex.confidence, `Location resolved to ${ex.location}`, "ai");

      if (dup) {
        next = log(
          next,
          "DUPLICATE_DETECTED",
          dup.incidentId,
          "AI",
          dup.similarity,
          `Similarity ${(dup.similarity * 100).toFixed(0)}% with existing incident`,
          "ai",
        );
      }

      const existing = dup ? next.incidents.find((i) => i.id === dup.incidentId) : undefined;
      if (existing) {
        const reportIds = [...existing.reportIds, reportId];
        const p = priority(existing.type, reportIds.length);
        const updated: Incident = {
          ...existing,
          reportIds,
          affectedPeople: existing.affectedPeople + ex.affectedPeople,
          priorityScore: p.score,
          priorityFactors: p.factors,
          urgency: p.urgency,
          updatedAt: now,
          status: existing.status === "resolved" ? "under_review" : existing.status,
        };
        next = {
          ...next,
          incidents: next.incidents.map((i) => (i.id === updated.id ? updated : i)),
          reports: next.reports.map((r) => (r.id === reportId ? { ...r, status: "merged", incidentId: updated.id } : r)),
        };
        next = log(next, "PRIORITY_RECOMMENDED", updated.id, "AI", p.score / 100, `Score ${p.score}/100`, "priority");
      } else {
        const p = priority(ex.incidentType, 1);
        const incident: Incident = {
          id: incidentId,
          type: ex.incidentType,
          location: ex.location,
          affectedPeople: ex.affectedPeople,
          requiredResource: ex.requiredResource,
          urgency: p.urgency,
          priorityScore: p.score,
          priorityFactors: p.factors,
          confidence: ex.confidence,
          status: "new",
          assignedVolunteerId: null,
          reportIds: [reportId],
          createdAt: now,
          updatedAt: now,
          verified: false,
        };
        next = {
          ...next,
          incidents: [incident, ...next.incidents],
          reports: next.reports.map((r) => (r.id === reportId ? { ...r, status: "processed", incidentId } : r)),
        };
        next = log(next, "INCIDENT_CREATED", incidentId, "AI", ex.confidence, `${ex.incidentType} at ${ex.location}`, "ai");
        next = log(next, "PRIORITY_RECOMMENDED", incidentId, "AI", p.score / 100, `Score ${p.score}/100`, "priority");
      }

      if (ex.urgency === "critical") {
        next = notify(
          next,
          "New critical incident detected",
          `${ex.incidentType} • ${ex.location} • ${ex.requiredResource}`,
          "critical",
          `/incidents/${incidentId}`,
        );
      }

      next = {
        ...next,
        aiStats: {
          ...next.aiStats,
          reportsProcessed: next.aiStats.reportsProcessed + 1,
          entitiesExtracted: next.aiStats.entitiesExtracted + 6,
          duplicatesDetected: next.aiStats.duplicatesDetected + (dup ? 1 : 0),
          clustersCreated: next.aiStats.clustersCreated + (dup ? 0 : 1),
        },
        lastProcessed: {
          reportId,
          incidentId,
          merged: Boolean(dup),
          similarity: dup?.similarity ?? 0,
          at: now,
        },
      };
      return next;
    });

    return { reportId, incidentId, extraction: ex, duplicate: dup };
  },

  mergeReports(incidentId: string, reportIds: string[]) {
    set((s) => {
      const inc = s.incidents.find((i) => i.id === incidentId);
      if (!inc) return s;
      const merged = Array.from(new Set([...inc.reportIds, ...reportIds]));
      const p = priority(inc.type, merged.length);
      const updated: Incident = {
        ...inc,
        reportIds: merged,
        priorityScore: p.score,
        priorityFactors: p.factors,
        urgency: p.urgency,
        updatedAt: new Date().toISOString(),
      };
      let next: CrisisState = {
        ...s,
        incidents: s.incidents.map((i) => (i.id === incidentId ? updated : i)),
        reports: s.reports.map((r) =>
          reportIds.includes(r.id) ? { ...r, status: "merged", incidentId } : r,
        ),
        aiStats: { ...s.aiStats, duplicatesDetected: s.aiStats.duplicatesDetected + reportIds.length },
      };
      next = log(next, "REPORTS_MERGED", incidentId, "Coordinator", null, `${reportIds.length} report(s) merged`, "human");
      next = notify(next, `${reportIds.length} duplicate reports merged`, `Consolidated into ${incidentId}`, "high", `/incidents/${incidentId}`);
      return next;
    });
  },

  keepSeparate(reportId: string) {
    set((s) => log(s, "DUPLICATE_REJECTED", reportId, "Coordinator", null, "Kept as a separate incident", "human"));
  },

  /* ------- incidents ------- */
  setIncidentStatus(incidentId: string, status: IncidentStatus) {
    set((s) => {
      const inc = s.incidents.find((i) => i.id === incidentId);
      if (!inc) return s;
      let next: CrisisState = {
        ...s,
        incidents: s.incidents.map((i) =>
          i.id === incidentId ? { ...i, status, updatedAt: new Date().toISOString() } : i,
        ),
      };
      if (status === "resolved" && inc.assignedVolunteerId) {
        next = {
          ...next,
          volunteers: next.volunteers.map((v) =>
            v.id === inc.assignedVolunteerId ? { ...v, status: "available", currentTaskId: null, completed: v.completed + 1 } : v,
          ),
        };
      }
      next = log(next, "STATUS_CHANGED", incidentId, "Coordinator", null, `Status → ${status.toUpperCase()}`, "status");
      return next;
    });
  },

  verifyPriority(incidentId: string, decision: "accept" | "reject", newScore?: number) {
    set((s) => {
      let next: CrisisState = {
        ...s,
        incidents: s.incidents.map((i) =>
          i.id === incidentId
            ? {
                ...i,
                verified: decision === "accept",
                priorityScore: newScore ?? i.priorityScore,
                status: decision === "accept" && i.status === "new" ? "prioritized" : i.status,
                updatedAt: new Date().toISOString(),
              }
            : i,
        ),
      };
      next = log(
        next,
        decision === "accept" ? "PRIORITY_ACCEPTED" : "PRIORITY_REJECTED",
        incidentId,
        "Coordinator",
        null,
        newScore ? `Coordinator set score to ${newScore}` : "Human verification recorded",
        "priority",
      );
      return next;
    });
  },

  assignVolunteer(incidentId: string, volunteerId: string) {
    set((s) => {
      const inc = s.incidents.find((i) => i.id === incidentId);
      const vol = s.volunteers.find((v) => v.id === volunteerId);
      if (!inc || !vol) return s;
      const taskId = uid("T");
      const task: Task = {
        id: taskId,
        incidentId,
        description: `Deliver ${inc.requiredResource} to ${inc.location}`,
        location: inc.location,
        urgency: inc.urgency,
        status: "assigned",
        assigneeId: volunteerId,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      let next: CrisisState = {
        ...s,
        tasks: [task, ...s.tasks],
        incidents: s.incidents.map((i) =>
          i.id === incidentId
            ? { ...i, assignedVolunteerId: volunteerId, status: "assigned", updatedAt: new Date().toISOString() }
            : i,
        ),
        volunteers: s.volunteers.map((v) => (v.id === volunteerId ? { ...v, status: "busy", currentTaskId: taskId } : v)),
        aiStats: {
          ...s.aiStats,
          resourcesMatched: s.aiStats.resourcesMatched + 1,
          tasksCreated: s.aiStats.tasksCreated + 1,
        },
      };
      next = log(next, "VOLUNTEER_ASSIGNED", incidentId, "Coordinator", null, `${vol.name} (${vol.team}) assigned`, "assignment");
      next = log(next, "TASK_CREATED", taskId, "System", null, task.description, "assignment");
      next = notify(next, `${vol.team} assigned to ${incidentId}`, task.description, inc.urgency, `/incidents/${incidentId}`);
      return next;
    });
  },

  /* ------- tasks ------- */
  setTaskStatus(taskId: string, status: TaskStatus) {
    set((s) => {
      const task = s.tasks.find((t) => t.id === taskId);
      if (!task) return s;
      const completedAt = status === "completed" ? new Date().toISOString() : null;
      let next: CrisisState = {
        ...s,
        tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status, completedAt } : t)),
      };
      const incStatus: IncidentStatus | null =
        status === "completed" ? "resolved" : status === "in_progress" ? "in_progress" : status === "assigned" ? "assigned" : null;
      if (incStatus) {
        next = {
          ...next,
          incidents: next.incidents.map((i) =>
            i.id === task.incidentId ? { ...i, status: incStatus, updatedAt: new Date().toISOString() } : i,
          ),
        };
      }
      if (status === "completed" && task.assigneeId) {
        next = {
          ...next,
          volunteers: next.volunteers.map((v) =>
            v.id === task.assigneeId ? { ...v, status: "available", currentTaskId: null, completed: v.completed + 1 } : v,
          ),
        };
      }
      next = log(next, "TASK_STATUS_CHANGED", taskId, "Coordinator", null, `Task → ${status.toUpperCase()}`, "status");
      if (status === "completed")
        next = notify(next, "Task completed", `${task.description} • ${task.incidentId}`, "low", `/incidents/${task.incidentId}`);
      return next;
    });
  },

  /* ------- resources ------- */
  reserveResource(id: string, qty: number) {
    set((s) => {
      const r = s.resources.find((x) => x.id === id);
      if (!r || r.available < qty) return s;
      let next: CrisisState = {
        ...s,
        resources: s.resources.map((x) =>
          x.id === id ? { ...x, available: x.available - qty, reserved: x.reserved + qty } : x,
        ),
      };
      next = log(next, "RESOURCE_RESERVED", id, "Coordinator", null, `${qty} ${r.unit} of ${r.name} reserved`, "human");
      return next;
    });
  },
  releaseResource(id: string, qty: number) {
    set((s) => {
      const r = s.resources.find((x) => x.id === id);
      if (!r || r.reserved < qty) return s;
      let next: CrisisState = {
        ...s,
        resources: s.resources.map((x) =>
          x.id === id ? { ...x, available: x.available + qty, reserved: x.reserved - qty } : x,
        ),
      };
      next = log(next, "RESOURCE_RELEASED", id, "Coordinator", null, `${qty} ${r.unit} of ${r.name} released`, "human");
      return next;
    });
  },
  updateResourceQuantity(id: string, available: number) {
    set((s) => {
      const r = s.resources.find((x) => x.id === id);
      if (!r) return s;
      let next: CrisisState = {
        ...s,
        resources: s.resources.map((x) => (x.id === id ? { ...x, available: Math.max(0, available) } : x)),
      };
      next = log(next, "RESOURCE_UPDATED", id, "Coordinator", null, `${r.name} stock set to ${available}`, "human");
      return next;
    });
  },

  /* ------- notifications ------- */
  markNotificationRead(id: string) {
    set((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
  },
  markAllRead() {
    set((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  },
  pushNotification(title: string, body: string, level: Urgency, link: string | null) {
    set((s) => notify(s, title, body, level, link));
  },
  auditEvent(action: string, entity: string, details: string, category: AuditLog["category"] = "human") {
    set((s) => log(s, action, entity, "Coordinator", null, details, category));
  },
};

export { matchResources };
export function getState() {
  return state;
}
