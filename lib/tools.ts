export type Profile = "individual" | "self" | "business";
export type ToolId = "income" | "salary" | "self" | "corp" | "vat" | "scan" | "enfia" | "rent" | "dividend";
export type ToolGroup = "core" | "assets" | "vat" | "docs";

export const TOOL_GROUP: Record<ToolId, ToolGroup> = {
  income: "core",
  salary: "core",
  self: "core",
  corp: "core",
  enfia: "assets",
  rent: "assets",
  dividend: "assets",
  vat: "vat",
  scan: "docs",
};

export const GROUPS: { id: ToolGroup; label: string; order: number }[] = [
  { id: "core", label: "Φορολογία εισοδήματος", order: 1 },
  { id: "assets", label: "Ακίνητα & επενδύσεις", order: 2 },
  { id: "vat", label: "ΦΠΑ", order: 3 },
  { id: "docs", label: "Έγγραφα", order: 4 },
];

export function groupedTools(profile: Profile): { group: ToolGroup; tools: ToolId[] }[] {
  const prof = profileById(profile);
  const byGroup = new Map<ToolGroup, ToolId[]>();
  for (const t of prof.tools) {
    const g = TOOL_GROUP[t];
    const arr = byGroup.get(g) ?? [];
    arr.push(t);
    byGroup.set(g, arr);
  }
  return GROUPS.filter((g) => byGroup.has(g.id))
    .sort((a, b) => a.order - b.order)
    .map((g) => ({ group: g.id, tools: byGroup.get(g.id)! }));
}

export const PROFILES: {
  id: Profile;
  icon: string;
  title: string;
  short: string;
  desc: string;
  tools: ToolId[];
  defaultTool: ToolId;
  defaultIncomeType: "wage" | "business" | "rent";
}[] = [
  {
    id: "individual",
    icon: "🧑",
    title: "Μισθωτός / Φυσικό πρόσωπο",
    short: "Μισθωτός",
    desc: "Μισθοί, συντάξεις, ενοίκια. Κλίμακα 9–44% με μείωση φόρου και τέκνα.",
    tools: ["income", "salary", "rent", "dividend", "vat", "enfia"],
    defaultTool: "income",
    defaultIncomeType: "wage",
  },
  {
    id: "self",
    icon: "💼",
    title: "Ελεύθερος επαγγελματίας",
    short: "Ελεύθερος επαγγελματίας",
    desc: "Ατομική επιχείρηση, μπλοκάκι. Ελάχιστο τεκμαρτό εισόδημα και προκαταβολή 100%.",
    tools: ["scan", "income", "self", "enfia", "rent", "vat"],
    defaultTool: "self",
    defaultIncomeType: "business",
  },
  {
    id: "business",
    icon: "🏢",
    title: "Επιχείρηση",
    short: "Επιχείρηση",
    desc: "Α.Ε., Ι.Κ.Ε., Ο.Ε., Ε.Ε. Φόρος νομικών προσώπων 22% και μερίσματα.",
    tools: ["scan", "self", "corp", "dividend", "vat", "enfia"],
    defaultTool: "corp",
    defaultIncomeType: "business",
  },
];

export const TOOLS: Record<ToolId, { label: string; icon: string }> = {
  income: { label: "Φόρος εισοδήματος", icon: "💶" },
  salary: { label: "Καθαρός μισθός", icon: "🧾" },
  self: { label: "Τεκμαρτό εισόδημα", icon: "📊" },
  corp: { label: "Φορολογία εταιρείας", icon: "🏢" },
  vat: { label: "ΦΠΑ", icon: "🧮" },
  scan: { label: "Σάρωση PDF", icon: "📄" },
  enfia: { label: "ΕΝΦΙΑ", icon: "🏠" },
  rent: { label: "Καθαρό ενοίκιο", icon: "🔑" },
  dividend: { label: "Μέρισμα & τόκοι", icon: "💸" },
};

export const profileById = (id: Profile) => PROFILES.find((p) => p.id === id)!;

export function isValidToolFor(profile: Profile, tool: string | undefined): tool is ToolId {
  if (!tool) return false;
  return profileById(profile).tools.includes(tool as ToolId);
}
