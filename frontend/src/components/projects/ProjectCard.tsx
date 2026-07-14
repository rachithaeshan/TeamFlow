import Link from "next/link";
import { Card, StatusBadge } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="flex flex-col gap-3 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate font-display text-base font-semibold text-ink">{project.name}</div>
            <div className="mt-0.5 text-xs text-slate">Managed by {project.manager.name}</div>
          </div>
          <StatusBadge status={project.status} />
        </div>
        {project.description && (
          <p className="line-clamp-2 text-sm text-slate">{project.description}</p>
        )}
        <div className="flex items-center justify-between border-t border-line pt-3 text-xs text-slate">
          <span>{project.members.length} member{project.members.length === 1 ? "" : "s"}</span>
          <span>{project._count.tasks} task{project._count.tasks === 1 ? "" : "s"}</span>
          <span>Started {formatDate(project.startDate)}</span>
        </div>
      </Card>
    </Link>
  );
}