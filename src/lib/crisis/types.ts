export type Source = "whatsapp" | "sms" | "social" | "voice" | "manual";
export type Urgency = "critical" | "high" | "medium" | "low";
export type IncidentStatus =
  | "new"
  | "under_review"
  | "prioritized"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "cancelled";
export type TaskStatus = "new" | "prioritized" | "assigned" | "in_progress" | "completed";
export type VolunteerStatus = "available" | "busy" | "offline";
export type ReportStatus = "pending" | "processed" | "merged";

export type IncidentType =
  | "Medical Emergency"
  | "Evacuation"
  | "Food Shortage"
  | "Water Shortage"
  | "Shelter Request"
  | "Rescue"
  | "Power Outage";

export interface LocationRef {
  id: string;
  name: string;
  lat: number;
  lng: number;
  ward: string;
}

export interface Report {
  id: string;
  source: Source;
  message: string;
  language: "en" | "ta" | "hi";
  location: string;
  affectedPeople: number;
  status: ReportStatus;
  urgency: Urgency | null;
  incidentId: string | null;
  createdAt: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  location: string;
  affectedPeople: number;
  requiredResource: string;
  urgency: Urgency;
  priorityScore: number;
  priorityFactors: { label: string; points: number }[];
  confidence: number;
  status: IncidentStatus;
  assignedVolunteerId: string | null;
  reportIds: string[];
  createdAt: string;
  updatedAt: string;
  verified: boolean;
}

export interface Volunteer {
  id: string;
  name: string;
  team: string;
  skills: string[];
  location: string;
  distanceKm: number;
  status: VolunteerStatus;
  currentTaskId: string | null;
  phone: string;
  completed: number;
}

export interface Resource {
  id: string;
  name: string;
  category: "Medical" | "Water" | "Food" | "Vehicle" | "Shelter" | "Rescue";
  available: number;
  reserved: number;
  location: string;
  unit: string;
}

export interface Task {
  id: string;
  incidentId: string;
  description: string;
  location: string;
  urgency: Urgency;
  status: TaskStatus;
  assigneeId: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AuditLog {
  id: string;
  ts: string;
  action: string;
  entity: string;
  actor: "System" | "AI" | "Coordinator";
  confidence: number | null;
  details: string;
  category: "ai" | "human" | "assignment" | "status" | "priority" | "report";
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  ts: string;
  read: boolean;
  link: string | null;
  level: Urgency;
}

export interface Shelter {
  id: string;
  name: string;
  location: string;
  capacity: number;
  occupied: number;
  lat: number;
  lng: number;
}

export interface Session {
  email: string;
  name: string;
  role: string;
  demo: boolean;
}

export interface CrisisState {
  session: Session | null;
  language: "en" | "ta" | "hi";
  reports: Report[];
  incidents: Incident[];
  volunteers: Volunteer[];
  resources: Resource[];
  tasks: Task[];
  audit: AuditLog[];
  notifications: Notification[];
  shelters: Shelter[];
  locations: LocationRef[];
  aiStats: {
    reportsProcessed: number;
    entitiesExtracted: number;
    duplicatesDetected: number;
    clustersCreated: number;
    resourcesMatched: number;
    tasksCreated: number;
  };
  lastProcessed: {
    reportId: string;
    incidentId: string;
    merged: boolean;
    similarity: number;
    at: string;
  } | null;
}
