"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { userApi, extractErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Role, UserSummary } from "@/lib/types";

export function UserRow({
  user,
  onChanged,
}: {
  user: UserSummary;
  onChanged: (user: UserSummary) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRoleChange(role: Role) {
    setBusy(true);
    setError(null);
    try {
      const updated = await userApi.update(user.id, { role });
      onChanged(updated);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleActive() {
    setBusy(true);
    setError(null);
    try {
      const updated = user.isActive
        ? await userApi.remove(user.id) // soft-delete = deactivate
        : await userApi.update(user.id, { isActive: true });
      onChanged(updated);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="py-3 pr-4">
        <div className="text-sm font-medium text-ink">{user.name}</div>
        <div className="text-xs text-slate">{user.email}</div>
      </td>
      <td className="py-3 pr-4">
        <Select
          aria-label={`Role for ${user.name}`}
          value={user.role}
          onChange={(e) => handleRoleChange(e.target.value as Role)}
          disabled={busy}
          className="w-auto"
        >
          <option value="ADMIN">Admin</option>
          <option value="PROJECT_MANAGER">Project Manager</option>
          <option value="TEAM_MEMBER">Team Member</option>
        </Select>
      </td>
      <td className="py-3 pr-4">
        <span
          className={
            user.isActive
              ? "inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal/10 px-2.5 py-0.5 text-xs font-medium text-teal"
              : "inline-flex items-center gap-1.5 rounded-full border border-slate/30 bg-slate/10 px-2.5 py-0.5 text-xs font-medium text-slate"
          }
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {user.isActive ? "Active" : "Deactivated"}
        </span>
      </td>
      <td className="py-3 pr-4 text-xs text-slate">{formatDate(user.createdAt)}</td>
      <td className="py-3 text-right">
        <Button variant={user.isActive ? "danger" : "secondary"} onClick={handleToggleActive} disabled={busy}>
          {user.isActive ? "Deactivate" : "Reactivate"}
        </Button>
        {error && <div className="mt-1 text-xs text-red">{error}</div>}
      </td>
    </tr>
  );
}