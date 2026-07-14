"use client";

import { useEffect, useState } from "react";
import { RouteGuard } from "@/lib/route-guard";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/ui/Card";
import { StatCards } from "@/components/dashboard/StatCards";
import { TasksByStatus } from "@/components/dashboard/TasksByStatus";
import { AiSummaryCard } from "@/components/dashboard/AiSummaryCard";
import { ChatWidget } from "@/components/tasks/ChatWidget";
import { TaskRow } from "@/components/tasks/TaskRow";
import { statsApi, taskApi, extractErrorMessage } from "@/lib/api";
import type { DashboardStats, Task } from "@/lib/types";

function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canUseAssistant = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, t] = await Promise.all([statsApi.dashboard(), taskApi.list()]);
        setStats(s);
        setTasks(t.slice(0, 6));
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <PageHeader
          eyebrow="Dashboard"
          title={`Welcome back, ${user?.name.split(" ")[0]}`}
          subtitle={
            user?.role === "TEAM_MEMBER"
              ? "Here's what's on your plate."
              : "Here's how your projects and team are doing."
          }
        />

        {error && <div className="mb-6 rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">{error}</div>}

        {loading || !stats ? (
          <p className="text-sm text-slate">Loading…</p>
        ) : (
          <div className="flex flex-col gap-6">
            <StatCards stats={stats} />

            <div className="grid gap-6 md:grid-cols-2">
              <TasksByStatus tasksByStatus={stats.tasksByStatus} />
              {canUseAssistant ? (
                <AiSummaryCard />
              ) : (
                <div className="rounded-xl border border-line bg-white p-5">
                  <h3 className="mb-2 font-display text-base font-semibold text-ink">Tip</h3>
                  <p className="text-sm text-slate">
                    Click into any task below to update its status, log progress, or leave a comment for your manager.
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-3 font-display text-base font-semibold text-ink">
                {user?.role === "TEAM_MEMBER" ? "Your tasks" : "Recent tasks"}
              </h3>
              {tasks.length === 0 ? (
                <p className="text-sm text-slate">No tasks yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {tasks.map((t) => (
                    <TaskRow key={t.id} task={t} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      {canUseAssistant && <ChatWidget />}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RouteGuard>
      <DashboardContent />
    </RouteGuard>
  );
}
