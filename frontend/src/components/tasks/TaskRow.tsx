import Link from "next/link";
import { Card, StatusBadge, PriorityBadge } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/lib/types";

export function TaskRow({ task }: { task: Task }) {
  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="flex items-center justify-between gap-4 transition-shadow hover:shadow-md">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-ink">{task.title}</div>
          <div className="mt-0.5 text-xs text-slate">
            {task.project.name} {task.assignee ? `· ${task.assignee.name}` : "· Unassigned"} · Due {formatDate(task.dueDate)}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
      </Card>
    </Link>
  );
}
