import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Estados padronizados: carregando, vazio, erro. Todo bloco que busca dados
 * usa estes três, com texto que diz o que aconteceu e o que fazer.
 */

export function LoadingState({ label = "Carregando…", className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cn("flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground", className)}>
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

interface MessageProps {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: MessageProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-4 py-10 text-center", className)}>
      {Icon && (
        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
        </span>
      )}
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Não foi possível carregar", description, action, className }: Partial<MessageProps>) {
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center px-4 py-10 text-center", className)}>
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/15">
        <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden />
      </span>
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Aviso em linha (informação, atenção, IA). */
export function Notice({
  tone = "info",
  icon: Icon,
  children,
  className,
}: {
  tone?: "info" | "warning" | "ai";
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-primary/25 bg-primary/10 text-foreground/90",
    warning: "border-warning/30 bg-warning/10 text-foreground/90",
    ai: "border-ai/30 bg-ai/10 text-foreground/90",
  };
  const iconTones = { info: "text-primary", warning: "text-warning", ai: "text-ai" };
  return (
    <div className={cn("flex gap-2.5 rounded-lg border px-3 py-2.5 text-sm", tones[tone], className)}>
      {Icon && <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconTones[tone])} aria-hidden />}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
