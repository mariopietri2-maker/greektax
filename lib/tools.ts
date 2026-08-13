export type Profile = "individual" | "self" | "business";
export type ToolId = "income" | "salary" | "self" | "corp" | "vat" | "scan";

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
    tools: ["income", "salary", "vat"],
    defaultTool: "income",
    defaultIncomeType: "wage",
  },
  {
    id: "self",
    icon: "💼",
    title: "Ελεύθερος επαγγελματίας",
    short: "Ελεύθερος επαγγελματίας",
    desc: "Ατομική επιχείρηση, μπλοκάκι. Ελάχιστο τεκμαρτό εισόδημα και προκαταβολή 100%.",
    tools: ["scan", "income", "self", "vat"],
    defaultTool: "self",
    defaultIncomeType: "business",
  },
  {
    id: "business",
    icon: "🏢",
    title: "Επιχείρηση",
    short: "Επιχείρηση",
    desc: "Α.Ε., Ι.Κ.Ε., Ο.Ε., Ε.Ε. Φόρος νομικών προσώπων 22% και μερίσματα.",
    tools: ["scan", "self", "corp", "vat"],
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
};

export const profileById = (id: Profile) => PROFILES.find((p) => p.id === id)!;

export function isValidToolFor(profile: Profile, tool: string | undefined): tool is ToolId {
  if (!tool) return false;
  return profileById(profile).tools.includes(tool as ToolId);
}
