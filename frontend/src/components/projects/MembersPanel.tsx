"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { projectApi, extractErrorMessage } from "@/lib/api";
import type { Project, UserSummary } from "@/lib/types";

export function MembersPanel({
  project,
  candidateUsers,
  canManage,
  onChanged,
}: {
  project: Project;
  candidateUsers: UserSummary[];
  canManage: boolean;
  onChanged: (project: Project) => void;
}) {
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const memberIds = new Set(project.members.map((m) => m.user.id));
  const available = candidateUsers.filter((u) => !memberIds.has(u.id) && u.role === "TEAM_MEMBER");

  async function handleAdd() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await projectApi.addMember(project.id, selected);
      onChanged(updated);
      setSelected("");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(userId: string) {
    setBusy(true);
    setError(null);
    try {
      const updated = await projectApi.removeMember(project.id, userId);
      onChanged(updated);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h3 className="mb-4 font-display text-base font-semibold text-ink">Team members</h3>

      {project.members.length === 0 ? (
        <p className="text-sm text-slate">No team members added yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {project.members.map((m) => (
            <li key={m.user.id} className="flex items-center justify-between py-2.5">
              <div>
                <div className="text-sm font-medium text-ink">{m.user.name}</div>
                <div className="text-xs text-slate">{m.user.email}</div>
              </div>
              {canManage && (
                <Button variant="ghost" onClick={() => handleRemove(m.user.id)} disabled={busy}>
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <div className="mt-4 flex items-end gap-2 border-t border-line pt-4">
          <div className="flex-1">
            <Select label="Add a team member" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Choose a team member…</option>
              {available.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={handleAdd} disabled={!selected || busy}>
            Add
          </Button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red">{error}</p>}
    </Card>
  );
}