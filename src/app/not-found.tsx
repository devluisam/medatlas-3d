import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell>
      <div className="container flex max-w-lg flex-col items-start gap-4 py-24">
        <p className="eyebrow">Erro 404</p>
        <h1 className="text-3xl font-semibold">Página não encontrada</h1>
        <p className="text-muted-foreground">O endereço pode ter mudado ou a estrutura não existe no atlas.</p>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/atlas">Ver o conteúdo</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Início</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
