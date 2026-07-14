"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects", label: "Projects" },
    ...(user.role === "ADMIN" ? [{ href: "/admin/users", label: "Users" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-8">
          <Link href="/dashboard">
            <Logo size="md" />
          </Link>
          <nav className="flex gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "bg-ink text-white"
                    : "text-slate hover:bg-paper hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-full border border-line py-1 pl-1 pr-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
              {initials(user.name)}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium text-ink">{user.name}</div>
              <div className="text-[11px] text-slate">{user.role.replace("_", " ")}</div>
            </div>
          </div>
          <Button variant="secondary" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
