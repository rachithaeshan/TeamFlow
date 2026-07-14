import { Card } from "@/components/ui/Card";
import { statusColors, statusLabel } from "@/lib/utils";

const STATUS_ORDER = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"];

export function TasksByStatus({ tasksByStatus }: { tasksByStatus: Record<string, number> }) {
  const total = Object.values(tasksByStatus).reduce((a, b) => a + b, 0) || 1;

  return (
    <Card>
      <h3 className="mb-4 font-display text-base font-semibold text-ink">Tasks by status</h3>
      <div className="flex flex-col gap-3">
        {STATUS_ORDER.map((status) => {
          const count = tasksByStatus[status] ?? 0;
          const pct = Math.round((count / total) * 100);
          const colorClass = statusColors[status]?.split(" ")[1] ?? "text-slate";
          return (
            <div key={status}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className={colorClass}>{statusLabel(status)}</span>
                <span className="text-slate">{count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
