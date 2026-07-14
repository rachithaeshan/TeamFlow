import { Logo } from "./Logo";

const VALUE_PROPS = [
  {
    title: "Built for how teams actually work",
    desc: "Admins manage the org, managers run their projects, team members focus on their tasks.",
  },
  {
    title: "Every task has a clear owner",
    desc: "Assignments, priorities, due dates, and progress — always visible, never lost in chat.",
  },
  {
    title: "A full audit trail, automatically",
    desc: "Every status change and comment is logged, so nothing slips through the cracks.",
  },
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-paper">
      {/* Branded panel - hidden on small screens */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-ink px-12 py-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <Logo variant="light" size="lg" />

        <div className="relative">
          <h1 className="font-display text-3xl font-semibold leading-snug">
            Plan the work. Assign the work. Watch it get done.
          </h1>
          <div className="mt-10 flex flex-col gap-6">
            {VALUE_PROPS.map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <div>
                  <div className="font-medium text-white">{item.title}</div>
                  <div className="mt-0.5 text-sm text-white/60">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-white/40">
          © {new Date().getFullYear()} TaskFlow. Plan. Assign. Track. Succeed.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo size="md" />
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
            <p className="mt-1.5 text-sm text-slate">{subtitle}</p>
          </div>

          {children}

          <div className="mt-6 text-center text-sm text-slate">{footer}</div>
        </div>
      </div>
    </div>
  );
}