"use client";

import { useEffect, useState } from "react";
import { RouteGuard } from "@/lib/route-guard";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { projectApi, extractErrorMessage } from "@/lib/api";
import type { Project } from "@/lib/types";

function ProjectsContent() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const canCreate = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await projectApi.list();
      setProjects(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <PageHeader
          eyebrow="Projects"
          title="Projects"
          subtitle={
            user?.role === "TEAM_MEMBER"
              ? "Projects you've been added to."
              : user?.role === "PROJECT_MANAGER"
                ? "Projects you manage."
                : "All projects across the organization."
          }
          action={
            canCreate && !showForm ? (
              <Button onClick={() => setShowForm(true)}>New project</Button>
            ) : undefined
          }
        />

        {error && (
          <div className="mb-6 rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">{error}</div>
        )}

        {showForm && (
          <ProjectForm
            onCreated={(p) => {
              setProjects((prev) => [p, ...prev]);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {loading ? (
          <p className="text-sm text-slate">Loading projects…</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-slate">
            {user?.role === "TEAM_MEMBER"
              ? "You haven't been added to any projects yet."
              : "No projects yet. Create one to get started."}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <RouteGuard>
      <ProjectsContent />
    </RouteGuard>
  );
}