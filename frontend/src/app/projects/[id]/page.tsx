"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RouteGuard } from "@/lib/route-guard";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/layout/Navbar";
import { Card, StatusBadge, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { TaskForm } from "@/components/projects/TaskForm";
import { MembersPanel } from "@/components/projects/MembersPanel";
import { TaskRow } from "@/components/tasks/TaskRow";
import { projectApi, taskApi, userApi, extractErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Project, Task, UserSummary, ProjectStatus } from "@/lib/types";

function ProjectDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [candidateUsers, setCandidateUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const canManage =
    !!project &&
    (user?.role === "ADMIN" || (user?.role === "PROJECT_MANAGER" && project.manager.id === user.id));

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [p, t] = await Promise.all([projectApi.getById(id), taskApi.list({ projectId: id })]);
      setProject(p);
      setTasks(t);

      if (user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER") {
        const users = await userApi.list();
        setCandidateUsers(users);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStatusChange(status: ProjectStatus) {
    if (!project) return;
    try {
      const updated = await projectApi.update(project.id, { status });
      setProject(updated);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleDelete() {
    if (!project) return;
    if (!confirm(`Delete "${project.name}"? This also deletes all its tasks.`)) return;
    try {
      await projectApi.remove(project.id);
      router.push("/projects");
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-sm text-slate">Loading project…</p>
        </main>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">{error}</div>
        </main>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <PageHeader
          eyebrow="Project"
          title={project.name}
          subtitle={`Managed by ${project.manager.name} · Started ${formatDate(project.startDate)}`}
          action={
            canManage ? (
              <div className="flex items-center gap-2">
                <Select
                  aria-label="Project status"
                  value={project.status}
                  onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
                  className="w-auto"
                >
                  <option value="PLANNING">Planning</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
                <Button variant="danger" onClick={handleDelete}>
                  Delete project
                </Button>
              </div>
            ) : (
              <StatusBadge status={project.status} />
            )
          }
        />

        {error && (
          <div className="mb-6 rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">{error}</div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {project.description && (
              <Card className="mb-6">
                <h3 className="mb-2 font-display text-base font-semibold text-ink">Description</h3>
                <p className="text-sm text-slate">{project.description}</p>
              </Card>
            )}

            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-ink">
                Tasks ({tasks.length})
              </h3>
              {canManage && !showTaskForm && (
                <Button variant="secondary" onClick={() => setShowTaskForm(true)}>
                  New task
                </Button>
              )}
            </div>

            {showTaskForm && (
              <TaskForm
                project={project}
                onCreated={(t) => {
                  setTasks((prev) => [t, ...prev]);
                  setShowTaskForm(false);
                }}
                onCancel={() => setShowTaskForm(false)}
              />
            )}

            {tasks.length === 0 ? (
              <p className="text-sm text-slate">No tasks in this project yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {tasks.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            )}
          </div>

          <div>
            <MembersPanel
              project={project}
              candidateUsers={candidateUsers}
              canManage={canManage}
              onChanged={setProject}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <RouteGuard>
      <ProjectDetailContent />
    </RouteGuard>
  );
}