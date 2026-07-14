import Image from "next/image";
import clsx from "clsx";

export function Logo({
  variant = "dark",
  size = "md",
}: {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}) {
  const textColor = variant === "dark" ? "text-ink" : "text-white";
  const sizes = { sm: "text-base", md: "text-lg", lg: "text-2xl" };
  const iconSizes = { sm: 24, md: 30, lg: 42 };
  const iconSize = iconSizes[size];

  return (
    <div className="flex items-center gap-2">
      <Image
        src="/taskflow-icon.png"
        alt="TaskFlow"
        width={iconSize}
        height={iconSize}
        className="shrink-0"
        priority
      />
      <span className={clsx("font-display font-semibold tracking-tight", textColor, sizes[size])}>
        Task<span className="text-accent">Flow</span>
      </span>
    </div>
  );
}