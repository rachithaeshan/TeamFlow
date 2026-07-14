"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { extractErrorMessage } from "@/lib/api";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/layout/AuthLayout";
import type { Role } from "@/lib/types";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("TEAM_MEMBER");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, password, role);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up your workspace in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink underline underline-offset-2">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Full name" required autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
        <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="TEAM_MEMBER">Team Member</option>
          <option value="PROJECT_MANAGER">Project Manager</option>
          <option value="ADMIN">Admin</option>
        </Select>

        {error && (
          <div className="rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-sm text-red">{error}</div>
        )}

        <Button type="submit" disabled={submitting} className="mt-2 w-full py-2.5">
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}