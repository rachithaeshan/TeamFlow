import { Card } from "@/components/ui/Card";
import type { DashboardStats } from "@/lib/types";

export function StatCards({ stats }: { stats: DashboardStats }) {
  const items = [
    { label: "Total projects", value: stats.totalProjects },
    { label: "Active projects", value: stats.activeProjects },
    { label: "Total tasks", value: stats.totalTasks },
    { label: "Overdue tasks", value: stats.overdueTasks },
    ...(stats.totalUsers !== undefined ? [{ label: "Active users", value: stats.totalUsers }] : []),
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label} className="text-center">
          <div className="font-display text-3xl font-semibold text-ink">{item.value}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-slate">{item.label}</div>
        </Card>
      ))}
    </div>
  );
}
