import type {
  AuditLog,
  CrisisState,
  Incident,
  IncidentType,
  LocationRef,
  Notification,
  Report,
  Resource,
  Shelter,
  Source,
  Task,
  Urgency,
  Volunteer,
} from "./types";

export const LOCATIONS: LocationRef[] = [
  { id: "L1", name: "Central Bus Stand", lat: 13.0694, lng: 80.2731, ward: "Ward 3" },
  { id: "L2", name: "Anna Nagar", lat: 13.085, lng: 80.2101, ward: "Ward 8" },
  { id: "L3", name: "T Nagar", lat: 13.0418, lng: 80.2341, ward: "Ward 12" },
  { id: "L4", name: "Velachery", lat: 12.9791, lng: 80.2209, ward: "Ward 18" },
  { id: "L5", name: "Adyar", lat: 13.0067, lng: 80.2572, ward: "Ward 15" },
  { id: "L6", name: "Guindy", lat: 13.0067, lng: 80.2206, ward: "Ward 14" },
  { id: "L7", name: "Tambaram", lat: 12.9229, lng: 80.1275, ward: "Ward 22" },
  { id: "L8", name: "Porur", lat: 13.0359, lng: 80.1567, ward: "Ward 9" },
  { id: "L9", name: "Mylapore", lat: 13.0339, lng: 80.2691, ward: "Ward 11" },
  { id: "L10", name: "Perambur", lat: 13.1105, lng: 80.2333, ward: "Ward 5" },
];

const BASE = new Date("2026-08-13T08:00:00.000Z").getTime();
const at = (minutes: number) => new Date(BASE + minutes * 60000).toISOString();

const MESSAGES: { text: string; source: Source; loc: string; type: IncidentType; res: string }[] = [
  {
    text: "Need insulin near central bus stand.",
    source: "whatsapp",
    loc: "Central Bus Stand",
    type: "Medical Emergency",
    res: "Insulin",
  },
  {
    text: "Diabetic patient is stranded near bus stand, needs medicine urgently.",
    source: "sms",
    loc: "Central Bus Stand",
    type: "Medical Emergency",
    res: "Insulin",
  },
  {
    text: "Urgent insulin needed close to main bus stop.",
    source: "whatsapp",
    loc: "Central Bus Stand",
    type: "Medical Emergency",
    res: "Insulin",
  },
  {
    text: "Medicine required for diabetic patient near the bus terminus.",
    source: "manual",
    loc: "Central Bus Stand",
    type: "Medical Emergency",
    res: "Insulin",
  },
  {
    text: "Water supply cut for two days in Ward 4, 60 families affected.",
    source: "social",
    loc: "Anna Nagar",
    type: "Water Shortage",
    res: "Drinking Water",
  },
  {
    text: "No drinking water in Anna Nagar east, please send tankers.",
    source: "whatsapp",
    loc: "Anna Nagar",
    type: "Water Shortage",
    res: "Drinking Water",
  },
  {
    text: "Elderly couple trapped on first floor, water rising in T Nagar.",
    source: "voice",
    loc: "T Nagar",
    type: "Rescue",
    res: "Rescue Boat",
  },
  {
    text: "Boat needed at T Nagar, two senior citizens stuck inside house.",
    source: "sms",
    loc: "T Nagar",
    type: "Rescue",
    res: "Rescue Boat",
  },
  {
    text: "Food packets not reached Velachery relief camp since morning.",
    source: "whatsapp",
    loc: "Velachery",
    type: "Food Shortage",
    res: "Food Packets",
  },
  {
    text: "200 people at Velachery camp without meals.",
    source: "social",
    loc: "Velachery",
    type: "Food Shortage",
    res: "Food Packets",
  },
  {
    text: "Pregnant woman needs hospital transport from Adyar.",
    source: "voice",
    loc: "Adyar",
    type: "Medical Emergency",
    res: "Ambulance",
  },
  {
    text: "Ambulance required Adyar signal, patient in labour.",
    source: "sms",
    loc: "Adyar",
    type: "Medical Emergency",
    res: "Ambulance",
  },
  {
    text: "Families want to move out of low lying street in Guindy.",
    source: "manual",
    loc: "Guindy",
    type: "Evacuation",
    res: "Evacuation Bus",
  },
  {
    text: "Evacuation help needed Guindy industrial estate area.",
    source: "whatsapp",
    loc: "Guindy",
    type: "Evacuation",
    res: "Evacuation Bus",
  },
  {
    text: "Shelter full at Tambaram, 30 more people arriving.",
    source: "sms",
    loc: "Tambaram",
    type: "Shelter Request",
    res: "Shelter Space",
  },
  {
    text: "Need blankets and mats at Tambaram shelter.",
    source: "whatsapp",
    loc: "Tambaram",
    type: "Shelter Request",
    res: "Blankets",
  },
  {
    text: "Power cut since last night in Porur, medical devices at risk.",
    source: "social",
    loc: "Porur",
    type: "Power Outage",
    res: "Generator",
  },
  {
    text: "Generator needed Porur dialysis clinic.",
    source: "voice",
    loc: "Porur",
    type: "Power Outage",
    res: "Generator",
  },
  {
    text: "Child with high fever near Mylapore tank, no clinic open.",
    source: "whatsapp",
    loc: "Mylapore",
    type: "Medical Emergency",
    res: "Medical Kit",
  },
  {
    text: "Doctor required Mylapore, child fever 103.",
    source: "sms",
    loc: "Mylapore",
    type: "Medical Emergency",
    res: "Medical Kit",
  },
  {
    text: "Perambur street flooded, 12 houses need evacuation.",
    source: "manual",
    loc: "Perambur",
    type: "Evacuation",
    res: "Evacuation Bus",
  },
  {
    text: "Rescue team needed Perambur, water waist deep.",
    source: "whatsapp",
    loc: "Perambur",
    type: "Rescue",
    res: "Rescue Boat",
  },
  {
    text: "Milk and baby food needed Anna Nagar shelter.",
    source: "sms",
    loc: "Anna Nagar",
    type: "Food Shortage",
    res: "Baby Food",
  },
  {
    text: "Drinking water tanker not arrived Velachery ward.",
    source: "whatsapp",
    loc: "Velachery",
    type: "Water Shortage",
    res: "Drinking Water",
  },
  {
    text: "Dialysis patient needs transport from T Nagar to hospital.",
    source: "voice",
    loc: "T Nagar",
    type: "Medical Emergency",
    res: "Ambulance",
  },
  {
    text: "Two families on rooftop in Adyar, please rescue.",
    source: "social",
    loc: "Adyar",
    type: "Rescue",
    res: "Rescue Boat",
  },
  {
    text: "Shelter space needed for 15 people at Guindy.",
    source: "manual",
    loc: "Guindy",
    type: "Shelter Request",
    res: "Shelter Space",
  },
  {
    text: "Food supply low at Porur community hall.",
    source: "whatsapp",
    loc: "Porur",
    type: "Food Shortage",
    res: "Food Packets",
  },
  {
    text: "சென்ட்ரல் பஸ் ஸ்டாண்டுக்கு அருகில் இன்சுலின் தேவை. சர்க்கரை நோயாளி ஒருவர் சிக்கியுள்ளார்.",
    source: "whatsapp",
    loc: "Central Bus Stand",
    type: "Medical Emergency",
    res: "Insulin",
  },
  {
    text: "पेरम्बूर में बिजली नहीं है, मरीज के लिए जनरेटर चाहिए।",
    source: "sms",
    loc: "Perambur",
    type: "Power Outage",
    res: "Generator",
  },
];

const URGENCY_BY_TYPE: Record<IncidentType, Urgency> = {
  "Medical Emergency": "critical",
  Rescue: "critical",
  Evacuation: "high",
  "Water Shortage": "high",
  "Food Shortage": "medium",
  "Shelter Request": "medium",
  "Power Outage": "high",
};

const SCORE: Record<Urgency, number> = { critical: 92, high: 74, medium: 55, low: 32 };

export function buildSeed(): CrisisState {
  const reports: Report[] = MESSAGES.map((m, i) => ({
    id: `R${101 + i}`,
    source: m.source,
    message: m.text,
    language: i === 28 ? "ta" : i === 29 ? "hi" : "en",
    location: m.loc,
    affectedPeople: m.type === "Medical Emergency" ? 1 : ((i * 7) % 40) + 3,
    status: "processed",
    urgency: URGENCY_BY_TYPE[m.type],
    incidentId: null,
    createdAt: at(i * 4),
  }));

  // Cluster reports into incidents by location + type
  const clusters = new Map<string, Report[]>();
  reports.forEach((r, i) => {
    const key = `${r.location}|${MESSAGES[i]!.type}`;
    const arr = clusters.get(key) ?? [];
    arr.push(r);
    clusters.set(key, arr);
  });

  const incidents: Incident[] = [];
  let n = 1041;
  for (const [key, group] of clusters) {
    const [loc, type] = key.split("|") as [string, IncidentType];
    const idx = MESSAGES.findIndex((m) => m.loc === loc && m.type === type);
    const urgency = URGENCY_BY_TYPE[type];
    const id = `INC-${n++}`;
    const merged = group.length > 1;
    const score = Math.min(100, SCORE[urgency] + (merged ? group.length * 2 : 0));
    group.forEach((r, gi) => {
      r.incidentId = id;
      if (gi > 0) r.status = "merged";
    });
    incidents.push({
      id,
      type,
      location: loc,
      affectedPeople: group.reduce((s, r) => s + r.affectedPeople, 0),
      requiredResource: MESSAGES[idx]!.res,
      urgency,
      priorityScore: score,
      priorityFactors: buildFactors(type, group.length),
      confidence: 0.86 + (group.length % 4) * 0.03,
      status: "new",
      assignedVolunteerId: null,
      reportIds: group.map((r) => r.id),
      createdAt: group[0]!.createdAt,
      updatedAt: group[group.length - 1]!.createdAt,
      verified: false,
    });
  }

  const volunteers: Volunteer[] = [
    ["V1", "Arun Kumar", "Team A", "Medical Aid,Transport", "Anna Nagar", 2.4],
    ["V2", "Priya Sharma", "Team B", "First Aid,Medical Aid", "Central Bus Stand", 1.2],
    ["V3", "Rahul Menon", "Team C", "Rescue,Boat Handling", "T Nagar", 3.1],
    ["V4", "Divya Ramesh", "Team A", "Logistics,Food Distribution", "Velachery", 4.6],
    ["V5", "Karthik S", "Team D", "Transport,Driving", "Guindy", 2.9],
    ["V6", "Meena Iyer", "Team B", "Medical Aid,Paediatrics", "Mylapore", 1.8],
    ["V7", "Suresh Babu", "Team E", "Rescue,Swimming", "Perambur", 5.2],
    ["V8", "Fatima Noor", "Team C", "First Aid,Shelter Management", "Tambaram", 6.4],
    ["V9", "Vignesh R", "Team D", "Electrical,Generators", "Porur", 3.7],
    ["V10", "Anitha George", "Team E", "Logistics,Water Supply", "Adyar", 2.2],
  ].map(([id, name, team, skills, location, dist], i) => ({
    id: id as string,
    name: name as string,
    team: team as string,
    skills: (skills as string).split(","),
    location: location as string,
    distanceKm: dist as number,
    status: i % 4 === 1 ? "busy" : i % 5 === 4 ? "offline" : "available",
    currentTaskId: null,
    phone: `+91 98${400 + i}0 1${100 + i}2`,
    completed: 3 + i * 2,
  }));

  const resources: Resource[] = [
    ["RS1", "Insulin", "Medical", 24, 6, "Ward 3 Medical Center", "vials"],
    ["RS2", "Medical Kit", "Medical", 40, 8, "Anna Nagar Depot", "kits"],
    ["RS3", "Ambulance", "Vehicle", 6, 2, "Guindy Base", "units"],
    ["RS4", "Drinking Water", "Water", 1200, 300, "Velachery Depot", "litres"],
    ["RS5", "Water Tanker", "Vehicle", 8, 3, "Porur Yard", "units"],
    ["RS6", "Food Packets", "Food", 900, 250, "T Nagar Kitchen", "packets"],
    ["RS7", "Baby Food", "Food", 150, 20, "Anna Nagar Depot", "packs"],
    ["RS8", "Rescue Boat", "Rescue", 10, 4, "Adyar River Base", "boats"],
    ["RS9", "Life Jackets", "Rescue", 120, 30, "Adyar River Base", "units"],
    ["RS10", "Blankets", "Shelter", 500, 120, "Tambaram Shelter", "units"],
    ["RS11", "Shelter Space", "Shelter", 320, 180, "City Shelters", "beds"],
    ["RS12", "Generator", "Vehicle", 12, 5, "Porur Yard", "units"],
    ["RS13", "Evacuation Bus", "Vehicle", 9, 3, "Perambur Depot", "units"],
    ["RS14", "Oxygen Cylinder", "Medical", 35, 11, "Ward 3 Medical Center", "cylinders"],
    ["RS15", "Torch & Batteries", "Rescue", 200, 40, "Mylapore Store", "sets"],
  ].map(([id, name, category, available, reserved, location, unit]) => ({
    id: id as string,
    name: name as string,
    category: category as Resource["category"],
    available: available as number,
    reserved: reserved as number,
    location: location as string,
    unit: unit as string,
  }));

  const tasks: Task[] = incidents.slice(0, 20).map((inc, i) => {
    const status: Task["status"] =
      i % 5 === 0 ? "new" : i % 5 === 1 ? "prioritized" : i % 5 === 2 ? "assigned" : i % 5 === 3 ? "in_progress" : "completed";
    const assignee = status === "new" || status === "prioritized" ? null : volunteers[i % volunteers.length]!.id;
    return {
      id: `T${201 + i}`,
      incidentId: inc.id,
      description: `Deliver ${inc.requiredResource} to ${inc.location}`,
      location: inc.location,
      urgency: inc.urgency,
      status,
      assigneeId: assignee,
      createdAt: at(i * 5 + 10),
      completedAt: status === "completed" ? at(i * 5 + 27) : null,
    };
  });

  tasks.forEach((t) => {
    const inc = incidents.find((i) => i.id === t.incidentId)!;
    if (t.status === "completed") inc.status = "resolved";
    else if (t.status === "in_progress") inc.status = "in_progress";
    else if (t.status === "assigned") inc.status = "assigned";
    else if (t.status === "prioritized") inc.status = "prioritized";
    if (t.assigneeId) {
      inc.assignedVolunteerId = t.assigneeId;
      const v = volunteers.find((x) => x.id === t.assigneeId)!;
      if (t.status !== "completed") {
        v.status = "busy";
        v.currentTaskId = t.id;
      }
    }
  });

  const audit: AuditLog[] = [];
  let a = 0;
  reports.slice(0, 12).forEach((r) => {
    audit.push(mkAudit(a++, "REPORT_RECEIVED", r.id, "System", null, `${r.source.toUpperCase()} report ingested`, "report"));
    audit.push(mkAudit(a++, "LOCATION_EXTRACTED", r.id, "AI", 0.94, `Location resolved to ${r.location}`, "ai"));
  });
  incidents.slice(0, 8).forEach((inc) => {
    audit.push(
      mkAudit(a++, "INCIDENT_CREATED", inc.id, "AI", inc.confidence, `${inc.type} at ${inc.location}`, "ai"),
    );
    if (inc.reportIds.length > 1)
      audit.push(
        mkAudit(a++, "DUPLICATE_DETECTED", inc.id, "AI", 0.92, `${inc.reportIds.length} reports clustered`, "ai"),
      );
    audit.push(
      mkAudit(a++, "PRIORITY_RECOMMENDED", inc.id, "AI", inc.priorityScore / 100, `Score ${inc.priorityScore}/100`, "priority"),
    );
    if (inc.assignedVolunteerId)
      audit.push(
        mkAudit(a++, "VOLUNTEER_ASSIGNED", inc.id, "Coordinator", null, `Assigned ${inc.assignedVolunteerId}`, "assignment"),
      );
  });

  const notifications: Notification[] = [
    ["New critical medical incident detected", "Insulin required at Central Bus Stand", "critical", "/incidents/INC-1041"],
    ["4 duplicate reports merged", "Reports clustered into INC-1041", "high", "/incidents/INC-1041"],
    ["Team B assigned to INC-1043", "Rescue operation underway", "high", "/incidents/INC-1043"],
    ["Water shortage reported at Anna Nagar", "60 families affected", "high", "/incidents/INC-1042"],
    ["Critical incident awaiting human verification", "Coordinator approval required", "critical", "/incidents/INC-1046"],
    ["Food supply low at Porur", "Community hall running out of packets", "medium", "/incidents"],
    ["Shelter nearing capacity", "Tambaram shelter at 88%", "medium", "/resources"],
    ["Generator dispatched to Porur", "Dialysis clinic supported", "medium", "/tasks"],
    ["New volunteer online", "Anitha George is available", "low", "/volunteers"],
    ["Daily summary ready", "Analytics updated for the shift", "low", "/analytics"],
  ].map(([title, body, level, link], i) => ({
    id: `N${i + 1}`,
    title: title as string,
    body: body as string,
    level: level as Urgency,
    link: link as string,
    ts: at(60 + i * 6),
    read: i > 5,
  }));

  const shelters: Shelter[] = [
    { id: "S1", name: "Anna Nagar Community Hall", location: "Anna Nagar", capacity: 250, occupied: 180, lat: 13.0855, lng: 80.2121 },
    { id: "S2", name: "T Nagar School Shelter", location: "T Nagar", capacity: 300, occupied: 265, lat: 13.0421, lng: 80.2351 },
    { id: "S3", name: "Velachery Relief Camp", location: "Velachery", capacity: 400, occupied: 320, lat: 12.9799, lng: 80.2219 },
    { id: "S4", name: "Tambaram Municipal Shelter", location: "Tambaram", capacity: 200, occupied: 176, lat: 12.9239, lng: 80.1285 },
    { id: "S5", name: "Guindy Sports Complex", location: "Guindy", capacity: 350, occupied: 120, lat: 13.0077, lng: 80.2216 },
    { id: "S6", name: "Mylapore Temple Hall", location: "Mylapore", capacity: 150, occupied: 90, lat: 13.0349, lng: 80.2701 },
    { id: "S7", name: "Perambur Rail Institute", location: "Perambur", capacity: 220, occupied: 145, lat: 13.1115, lng: 80.2343 },
    { id: "S8", name: "Adyar Cultural Centre", location: "Adyar", capacity: 180, occupied: 70, lat: 13.0077, lng: 80.2582 },
    { id: "S9", name: "Porur Community Hall", location: "Porur", capacity: 160, occupied: 132, lat: 13.0369, lng: 80.1577 },
    { id: "S10", name: "Central Relief Point", location: "Central Bus Stand", capacity: 500, occupied: 410, lat: 13.0704, lng: 80.2741 },
  ];

  return {
    session: null,
    language: "en",
    reports,
    incidents,
    volunteers,
    resources,
    tasks,
    audit: audit.reverse(),
    notifications,
    shelters,
    locations: LOCATIONS,
    aiStats: {
      reportsProcessed: reports.length,
      entitiesExtracted: reports.length * 6,
      duplicatesDetected: reports.filter((r) => r.status === "merged").length,
      clustersCreated: incidents.length,
      resourcesMatched: tasks.length,
      tasksCreated: tasks.length,
    },
    lastProcessed: null,
  };
}

function mkAudit(
  i: number,
  action: string,
  entity: string,
  actor: AuditLog["actor"],
  confidence: number | null,
  details: string,
  category: AuditLog["category"],
): AuditLog {
  return { id: `A${i + 1}`, ts: at(i * 2), action, entity, actor, confidence, details, category };
}

export function buildFactors(type: IncidentType, reportCount: number) {
  const f: { label: string; points: number }[] = [];
  if (type === "Medical Emergency") f.push({ label: "Medical emergency", points: 35 });
  if (type === "Rescue") f.push({ label: "Life-threatening rescue", points: 35 });
  if (type === "Evacuation") f.push({ label: "Evacuation required", points: 28 });
  if (type === "Water Shortage" || type === "Food Shortage") f.push({ label: "Essential supply gap", points: 22 });
  if (type === "Shelter Request") f.push({ label: "Shelter need", points: 18 });
  if (type === "Power Outage") f.push({ label: "Critical infrastructure", points: 24 });
  f.push({ label: "Vulnerable person", points: 25 });
  f.push({ label: "Time sensitivity", points: 20 });
  if (reportCount > 1) f.push({ label: "Multiple reports", points: Math.min(10, reportCount * 3) });
  f.push({ label: "Location confidence", points: 4 });
  return f;
}
