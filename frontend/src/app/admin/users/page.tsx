"use client";

import { useEffect, useState } from "react";
import { RouteGuard } from "@/lib/route-guard";
import { Navbar } from "@/components/layout/Navbar";
import { Card, PageHeader } from "@/components/ui/Card";
import { UserRow } from "@/components/admin/UserRow";
import { userApi, extractErrorMessage } from "@/lib/api";
import type { UserSummary } from "@/lib/types";

function AdminUsersContent() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.list();
      setUsers(data);
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
      <main className="mx-auto max-w-5xl px-6 py-10">
        <PageHeader
          eyebrow="Admin"
          title="Users"
          subtitle="Manage roles and account access across the organization."
        />

        {error && (
          <div className="mb-6 rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">{error}</div>
        )}

        {loading ? (
          <p className="text-sm text-slate">Loading users…</p>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line text-xs font-medium uppercase tracking-wide text-slate">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Joined</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    onChanged={(updated) =>
                      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
                    }
                  />
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <AdminUsersContent />
    </RouteGuard>
  );
}