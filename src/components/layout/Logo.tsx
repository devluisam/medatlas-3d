import Link from "next/link";
import { cn } from "@/lib/utils";

/** Marca: vértebra estilizada (corpo + processo espinhoso) num quadrado. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/40", className)}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <ellipse cx="12" cy="8" rx="6" ry="3.2" />
        <path d="M6.5 10.5 4 13M17.5 10.5 20 13M12 11.2V20" />
        <circle cx="12" cy="8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

export function Logo({ className, href = "/", compact }: { className?: string; href?: string; compact?: boolean }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 rounded-md", className)} aria-label="MEDATLAS 3D — início">
      <LogoMark />
      <span className={cn("font-display text-[15px] font-semibold tracking-tight", compact && "hidden sm:inline")}>
        MEDATLAS <span className="text-primary">3D</span>
      </span>
    </Link>
  );
}
