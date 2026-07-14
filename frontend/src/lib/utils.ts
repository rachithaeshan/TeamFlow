export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export const statusColors: Record<string, string> = {
  TODO: "bg-slate/10 text-slate border-slate/30",
  IN_PROGRESS: "bg-accent/10 text-accent border-accent/30",
  IN_REVIEW: "bg-amber/10 text-amber border-amber/30",
  DONE: "bg-teal/10 text-teal border-teal/30",
  BLOCKED: "bg-red/10 text-red border-red/30",
  PLANNING: "bg-slate/10 text-slate border-slate/30",
  ACTIVE: "bg-teal/10 text-teal border-teal/30",
  ON_HOLD: "bg-amber/10 text-amber border-amber/30",
  COMPLETED: "bg-accent/10 text-accent border-accent/30",
  ARCHIVED: "bg-slate/10 text-slate border-slate/30",
};

export const priorityColors: Record<string, string> = {
  LOW: "bg-slate/10 text-slate border-slate/30",
  MEDIUM: "bg-accent/10 text-accent border-accent/30",
  HIGH: "bg-amber/10 text-amber border-amber/30",
  URGENT: "bg-red/10 text-red border-red/30",
};

export function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}
