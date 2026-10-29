import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Markdown do conteúdo e do tutor. react-markdown não interpreta HTML bruto,
 * então texto vindo da IA não injeta marcação na página.
 */
export function Markdown({ children, className, size = "sm" }: { children: string; className?: string; size?: "sm" | "base" }) {
  return (
    <div
      className={cn(
        "prose prose-invert max-w-none prose-headings:font-display prose-headings:font-semibold prose-h2:mt-6 prose-h2:text-base prose-h3:text-sm prose-p:leading-relaxed prose-li:my-0.5",
        size === "sm" ? "prose-sm" : "prose-base",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
