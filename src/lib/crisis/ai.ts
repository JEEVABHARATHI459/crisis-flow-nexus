import { LOCATIONS, buildFactors } from "./seed";
import type { Incident, IncidentType, Report, Urgency, Volunteer } from "./types";

/**
 * Deterministic, rule-based extraction service.
 * NOTE: this is NOT a real LLM. It is a local heuristic engine that mirrors the
 * shape of a model response so a hosted model can be swapped in behind
 * `extract()` without touching any UI code.
 */

export interface Extraction {
  incidentType: IncidentType;
  location: string;
  affectedPeople: number;
  requiredResource: string;
  urgency: Urgency;
  confidence: number;
  keywords: string[];
  language: "en" | "ta" | "hi";
  duplicateCandidates: { incidentId: string; similarity: number }[];
}

const TYPE_RULES: { type: IncidentType; resource: string; words: string[] }[] = [
  {
    type: "Medical Emergency",
    resource: "Medical Kit",
    words: ["insulin", "diabetic", "medicine", "doctor", "patient", "fever", "injury", "ambulance", "dialysis", "pregnant", "oxygen", "இன்சுலின்", "நோயாளி", "मरीज", "दवा"],
  },
  { type: "Rescue", resource: "Rescue Boat", words: ["trapped", "stranded", "rescue", "boat", "rooftop", "drowning", "சிக்கி", "फंसे"] },
  { type: "Evacuation", resource: "Evacuation Bus", words: ["evacuate", "evacuation", "move out", "shift families", "flooded street"] },
  { type: "Water Shortage", resource: "Drinking Water", words: ["water", "tanker", "drinking", "தண்ணீர்", "पानी"] },
  { type: "Food Shortage", resource: "Food Packets", words: ["food", "meal", "hungry", "milk", "baby food", "ration", "உணவு", "खाना"] },
  { type: "Shelter Request", resource: "Shelter Space", words: ["shelter", "blanket", "mat", "camp full", "tent"] },
  { type: "Power Outage", resource: "Generator", words: ["power", "electricity", "generator", "current", "बिजली", "மின்சாரம்"] },
];

const RESOURCE_WORDS: Record<string, string> = {
  insulin: "Insulin",
  இன்சுலின்: "Insulin",
  ambulance: "Ambulance",
  oxygen: "Oxygen Cylinder",
  boat: "Rescue Boat",
  blanket: "Blankets",
  generator: "Generator",
  जनरेटर: "Generator",
  tanker: "Water Tanker",
  "baby food": "Baby Food",
  milk: "Baby Food",
  bus: "Evacuation Bus",
};

const VULNERABLE = ["child", "baby", "elderly", "senior", "pregnant", "diabetic", "patient", "disabled", "நோயாளி", "मरीज"];
const URGENT_WORDS = ["urgent", "immediately", "critical", "emergency", "dying", "asap", "now", "தேவை", "तुरंत"];

export function detectLanguage(text: string): "en" | "ta" | "hi" {
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  return "en";
}

export function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP = new Set(["the", "a", "an", "is", "near", "at", "to", "for", "in", "of", "and", "need", "needed", "please", "we", "our"]);

export function tokens(text: string) {
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 2 && !STOP.has(w));
}

export function similarity(a: string, b: string) {
  const A = new Set(tokens(a));
  const B = new Set(tokens(b));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  A.forEach((w) => {
    if (B.has(w)) inter += 1;
  });
  const union = new Set([...A, ...B]).size;
  return inter / union;
}

const LOCATION_ALIASES: Record<string, string> = {
  "bus stand": "Central Bus Stand",
  "bus stop": "Central Bus Stand",
  "bus terminus": "Central Bus Stand",
  "பஸ் ஸ்டாண்ட": "Central Bus Stand",
  "anna nagar": "Anna Nagar",
  "t nagar": "T Nagar",
  velachery: "Velachery",
  adyar: "Adyar",
  guindy: "Guindy",
  tambaram: "Tambaram",
  porur: "Porur",
  mylapore: "Mylapore",
  perambur: "Perambur",
  पेरम्बूर: "Perambur",
  "சென்ட்ரல்": "Central Bus Stand",
};

export function identifyLocation(text: string, fallback?: string) {
  const t = text.toLowerCase();
  for (const [alias, name] of Object.entries(LOCATION_ALIASES)) {
    if (t.includes(alias)) return name;
  }
  if (fallback) {
    const known = LOCATIONS.find((l) => l.name.toLowerCase() === fallback.toLowerCase());
    return known ? known.name : fallback;
  }
  return "Unknown Location";
}

export function extract(
  message: string,
  incidents: Incident[],
  opts: { location?: string; affectedPeople?: number } = {},
): Extraction {
  const t = message.toLowerCase();
  let best = { type: "Medical Emergency" as IncidentType, resource: "Medical Kit", hits: 0 };
  for (const rule of TYPE_RULES) {
    const hits = rule.words.filter((w) => t.includes(w)).length;
    if (hits > best.hits) best = { type: rule.type, resource: rule.resource, hits };
  }
  if (best.hits === 0) best = { type: "Shelter Request", resource: "Shelter Space", hits: 0 };

  let resource = best.resource;
  for (const [word, res] of Object.entries(RESOURCE_WORDS)) {
    if (t.includes(word)) {
      resource = res;
      break;
    }
  }

  const location = identifyLocation(message, opts.location);
  const vulnerable = VULNERABLE.some((w) => t.includes(w));
  const urgent = URGENT_WORDS.some((w) => t.includes(w));

  let urgency: Urgency = "medium";
  if (best.type === "Medical Emergency" || best.type === "Rescue") urgency = "critical";
  else if (best.type === "Evacuation" || best.type === "Water Shortage" || best.type === "Power Outage") urgency = "high";
  if (urgent && urgency === "medium") urgency = "high";

  const numberMatch = message.match(/(\d+)\s*(people|persons|families|members|patients)?/i);
  const affectedPeople =
    opts.affectedPeople && opts.affectedPeople > 0
      ? opts.affectedPeople
      : numberMatch && numberMatch[1]
        ? Math.min(500, parseInt(numberMatch[1], 10))
        : 1;

  const duplicateCandidates = incidents
    .map((inc) => {
      const text = `${inc.type} ${inc.location} ${inc.requiredResource}`;
      let s = similarity(message, text);
      if (inc.location === location) s += 0.45;
      if (inc.requiredResource.toLowerCase() === resource.toLowerCase()) s += 0.3;
      if (inc.type === best.type) s += 0.15;
      return { incidentId: inc.id, similarity: Math.min(0.99, s) };
    })
    .filter((c) => c.similarity >= 0.6)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  const confidence = Math.min(
    0.98,
    0.62 + best.hits * 0.07 + (location !== "Unknown Location" ? 0.15 : 0) + (vulnerable ? 0.05 : 0),
  );

  return {
    incidentType: best.type,
    location,
    affectedPeople,
    requiredResource: resource,
    urgency,
    confidence,
    keywords: tokens(message).slice(0, 8),
    language: detectLanguage(message),
    duplicateCandidates,
  };
}

export function priority(type: IncidentType, reportCount: number) {
  const factors = buildFactors(type, reportCount);
  const score = Math.min(100, factors.reduce((s, f) => s + f.points, 0));
  const urgency: Urgency = score >= 85 ? "critical" : score >= 70 ? "high" : score >= 50 ? "medium" : "low";
  return { factors, score, urgency };
}

export interface Match {
  volunteer: Volunteer;
  score: number;
  reasons: string[];
}

const SKILL_FOR_TYPE: Record<IncidentType, string[]> = {
  "Medical Emergency": ["Medical Aid", "First Aid", "Paediatrics"],
  Rescue: ["Rescue", "Boat Handling", "Swimming"],
  Evacuation: ["Transport", "Driving", "Logistics"],
  "Food Shortage": ["Logistics", "Food Distribution"],
  "Water Shortage": ["Logistics", "Water Supply"],
  "Shelter Request": ["Shelter Management", "Logistics"],
  "Power Outage": ["Electrical", "Generators"],
};

export function matchResources(incident: Incident, volunteers: Volunteer[]): Match[] {
  const wanted = SKILL_FOR_TYPE[incident.type] ?? [];
  return volunteers
    .filter((v) => v.status !== "offline")
    .map((v) => {
      const reasons: string[] = [];
      let score = 40;
      const skillHit = v.skills.filter((s) => wanted.includes(s)).length;
      if (skillHit) {
        score += 28 + (skillHit - 1) * 6;
        reasons.push(`Skill match: ${v.skills.filter((s) => wanted.includes(s)).join(", ")}`);
      }
      const distScore = Math.max(0, 20 - v.distanceKm * 2.5);
      score += distScore;
      reasons.push(`${v.distanceKm} km away`);
      if (v.location === incident.location) {
        score += 8;
        reasons.push("Already in the affected area");
      }
      if (v.status === "available") {
        score += 10;
        reasons.push("Currently available");
      } else {
        score -= 18;
        reasons.push("Currently busy on another task");
      }
      if (incident.urgency === "critical" && skillHit) score += 4;
      return { volunteer: v, score: Math.max(5, Math.min(99, Math.round(score))), reasons };
    })
    .sort((a, b) => b.score - a.score);
}
