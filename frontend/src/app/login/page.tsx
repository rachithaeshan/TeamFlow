"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { extractErrorMessage } from "@/lib/api";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Task<span className="text-accent">Flow</span>
          </h1>
          <p className="mt-1 text-sm text-slate">Sign in to your workspace</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-line bg-white p-6 shadow-sm">
          <Input label="Email" type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          {error && <p className="rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-sm text-red">{error}</p>}
          <Button type="submit" disabled={submitting} className="mt-2 w-full">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-ink underline">Create one</Link>
        </p>
        <div className="mt-6 rounded-lg border border-line bg-white/60 p-3 text-xs text-slate">
          <div className="mb-1 font-medium text-ink">Demo accounts (seeded):</div>
          admin@taskflow.dev · pm@taskflow.dev · dev1@taskflow.dev — password: password123
        </div>
      </div>
    </div>
  );
}
