import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/** Moldura das páginas comuns: cabeçalho, conteúdo e rodapé. */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
