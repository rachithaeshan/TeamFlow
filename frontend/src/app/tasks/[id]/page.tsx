"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RouteGuard } from "@/lib/route-guard";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/layout/Navbar";
import { Card, StatusBadge, PriorityBadge, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Field";
import { taskApi, extractErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Task, TaskComment, TaskActivity, TaskStatus } from "@/lib/types";

function activityLabel(a: TaskActivity): string {
  switch (a.action) {
    case "CREATED":
      return `${a.user.name} created this task`;
    case "STATUS_CHANGED":
      return `${a.user.name} changed status: ${a.fromValue} → ${a.toValue}`;
    case "PROGRESS_UPDATED":
      return `${a.user.name} updated progress: ${a.fromValue}% → ${a.toValue}%`;
    case "REASSIGNED":
      return `${a.user.name} reassigned this task`;
    default:
      return `${a.user.name} · ${a.action}`;
  }
}

function TaskDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activity, setActivity] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [progressInput, setProgressInput] = useState(0);
  const [busy, setBusy] = useState(false);

  const isAssignee = !!task && task.assignee?.id === user?.id;
  const isManager =
    !!task && (user?.role === "ADMIN" || (user?.role === "PROJECT_MANAGER" && task.project.managerId === user.id));
  const canUpdateProgress = isAssignee || isManager;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [t, c, a] = await Promise.all([
        taskApi.getById(id),
        taskApi.listComments(id),
        taskApi.listActivity(id),
      ]);
      setTask(t);
      setComments(c);
      setActivity(a);
      setProgressInput(t.progress);
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

  async function handleStatusChange(status: TaskStatus) {
    if (!task) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await taskApi.updateStatus(task.id, status);
      setTask(updated);
      setProgressInput(updated.progress);
      const a = await taskApi.listActivity(task.id);
      setActivity(a);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleProgressSave() {
    if (!task) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await taskApi.updateProgress(task.id, progressInput);
      setTask(updated);
      const a = await taskApi.listActivity(task.id);
      setActivity(a);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !task) return;
    setBusy(true);
    setError(null);
    try {
      const comment = await taskApi.addComment(task.id, newComment.trim());
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    if (!confirm(`Delete task "${task.title}"?`)) return;
    try {
      await taskApi.remove(task.id);
      router.push(`/projects/${task.project.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 py-10">
          <p className="text-sm text-slate">Loading task…</p>
        </main>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">{error}</div>
        </main>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link href={`/projects/${task.project.id}`} className="mb-4 inline-block text-sm text-accent hover:underline">
          ← {task.project.name}
        </Link>

        <PageHeader
          eyebrow="Task"
          title={task.title}
          subtitle={`Assigned to ${task.assignee?.name ?? "Unassigned"} · Due ${formatDate(task.dueDate)}`}
          action={
            isManager ? (
              <Button variant="danger" onClick={handleDelete}>
                Delete task
              </Button>
            ) : undefined
          }
        />

        {error && (
          <div className="mb-6 rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">{error}</div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
              </div>
              {task.description && <p className="text-sm text-slate">{task.description}</p>}
            </Card>

            {canUpdateProgress && (
              <Card>
                <h3 className="mb-4 font-display text-base font-semibold text-ink">Update progress</h3>
                <div className="flex flex-col gap-4">
                  <Select
                    label="Status"
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                    disabled={busy}
                  >
                    <option value="TODO">To do</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="IN_REVIEW">In review</option>
                    <option value="DONE">Done</option>
                    <option value="BLOCKED">Blocked</option>
                  </Select>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                      Progress: {progressInput}%
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={progressInput}
                        onChange={(e) => setProgressInput(Number(e.target.value))}
                        className="flex-1"
                      />
                      <Button variant="secondary" onClick={handleProgressSave} disabled={busy}>
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <h3 className="mb-4 font-display text-base font-semibold text-ink">
                Comments ({comments.length})
              </h3>
              <div className="mb-4 flex flex-col gap-3">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate">No comments yet.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="rounded-lg bg-paper px-3 py-2.5">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-ink">{c.user.name}</span>
                        <span className="text-[11px] text-slate">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-ink">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleAddComment} className="flex flex-col gap-2">
                <Textarea
                  placeholder="Add a comment…"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button type="submit" disabled={busy || !newComment.trim()} className="self-end">
                  Post comment
                </Button>
              </form>
            </Card>
          </div>

          <div>
            <Card>
              <h3 className="mb-3 font-display text-base font-semibold text-ink">Activity</h3>
              {activity.length === 0 ? (
                <p className="text-sm text-slate">No activity yet.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {activity.map((a) => (
                    <li key={a.id} className="text-xs">
                      <div className="text-ink">{activityLabel(a)}</div>
                      <div className="text-slate">{formatDate(a.createdAt)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TaskDetailPage() {
  return (
    <RouteGuard>
      <TaskDetailContent />
    </RouteGuard>
  );
}