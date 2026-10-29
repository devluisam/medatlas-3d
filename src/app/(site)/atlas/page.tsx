import type { Metadata } from "next";
import Link from "next/link";
import { Box, Search } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/state";
import { categoryLabel, regionLabel, SYSTEM_KEYS, SYSTEMS, systemLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { listStructures, StructureFiltersSchema } from "@/server/structures";

export const metadata: Metadata = {
  title: "Conteúdo",
  description: "Todas as estruturas do atlas: anatomia, irrigação, inervação e correlações clínicas, com busca por nome sem acento.",
};
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AtlasPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  // Parâmetro inválido na URL é ignorado em vez de quebrar a página
  const parsed = StructureFiltersSchema.safeParse({ q: first(raw.q), system: first(raw.system), model: first(raw.model) });
  const filters = parsed.success ? parsed.data : { limit: 100 };
  const [items, all] = await Promise.all([listStructures(filters), listStructures()]);

  const counts = new Map<string, number>();
  for (const s of all) counts.set(s.system, (counts.get(s.system) ?? 0) + 1);
  const systems = SYSTEM_KEYS.filter((k) => counts.has(k));

  const href = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const next = { q: filters.q, system: filters.system, model: filters.model, ...patch };
    for (const [k, v] of Object.entries(next)) if (v) p.set(k, v);
    const qs = p.toString();
    return qs ? `/atlas?${qs}` : "/atlas";
  };

  return (
    <PageShell>
      <div className="container space-y-8 py-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Conteúdo do atlas</h1>
          <p className="max-w-2xl text-muted-foreground">
            {all.length} estruturas com texto de estudo, questões e flashcards. As marcadas com <Box className="inline h-4 w-4 text-primary" aria-label="ícone de cubo" /> também
            estão no modelo 3D.
          </p>
        </header>

        <form action="/atlas" className="flex max-w-xl gap-2" role="search">
          {filters.system && <input type="hidden" name="system" value={filters.system} />}
          {filters.model && <input type="hidden" name="model" value={filters.model} />}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input name="q" defaultValue={filters.q ?? ""} placeholder="Buscar: femur, coracao, nervo…" aria-label="Buscar estrutura" className="pl-9" />
          </div>
          <Button type="submit">Buscar</Button>
        </form>

        <nav aria-label="Filtrar por sistema" className="flex flex-wrap gap-2">
          <Link
            href={href({ system: undefined })}
            aria-current={!filters.system ? "page" : undefined}
            className={cn("rounded-full border px-3 py-1 text-sm", !filters.system ? "border-primary bg-primary/15" : "border-border text-muted-foreground hover:text-foreground")}
          >
            Todos
          </Link>
          {systems.map((k) => (
            <Link
              key={k}
              href={href({ system: k })}
              aria-current={filters.system === k ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm",
                filters.system === k ? "border-primary bg-primary/15" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: SYSTEMS[k].color }} />
              {SYSTEMS[k].label}
              <span className="text-xs opacity-70">{counts.get(k)}</span>
            </Link>
          ))}
          <Link
            href={href({ model: filters.model === "with" ? undefined : "with" })}
            aria-current={filters.model === "with" ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm",
              filters.model === "with" ? "border-primary bg-primary/15" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Box className="h-3.5 w-3.5" aria-hidden /> Só no modelo 3D
          </Link>
        </nav>

        {items.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Nenhuma estrutura encontrada"
            description={filters.q ? `Nada com “${filters.q}” nesses filtros.` : "Nenhuma estrutura nesses filtros."}
            action={
              <Button asChild variant="outline">
                <Link href="/atlas">Limpar filtros</Link>
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <li key={s.slug}>
                <Link href={`/atlas/${s.slug}`} className="flex h-full flex-col rounded-xl border border-border/80 bg-card/50 p-4 transition-colors hover:border-primary/50">
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-medium">{s.name}</span>
                    {s.hasModel && <Box className="h-4 w-4 shrink-0 text-primary" aria-label="no modelo 3D" />}
                  </span>
                  {s.scientificName && <span className="text-xs italic text-muted-foreground">{s.scientificName}</span>}
                  <span className="mt-2 line-clamp-2 text-sm text-muted-foreground">{s.summary.replace(/[*_#`]/g, "")}</span>
                  <span className="mt-auto pt-3 text-xs text-muted-foreground">
                    {categoryLabel(s.category)} · {systemLabel(s.system)} · {regionLabel(s.region)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
