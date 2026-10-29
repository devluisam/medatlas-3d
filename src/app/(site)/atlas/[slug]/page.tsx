import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, Box } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { AnatomySection, ClinicalSection, SummarySection } from "@/components/study/StructureSections";
import { StructureStudyTools } from "@/components/study/StructureStudyTools";
import { ApiError, SlugSchema } from "@/server/http";
import { getStructure } from "@/server/structures";
import { getUserId } from "@/server/session";

export const dynamic = "force-dynamic";

const load = cache(async (slug: string) => {
  if (!SlugSchema.safeParse(slug).success) return null;
  try {
    return await getStructure(slug);
  } catch (e) {
    if (e instanceof ApiError && e.code === "NOT_FOUND") return null;
    throw e;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = await load((await params).slug);
  if (!s) return { title: "Estrutura não encontrada" };
  return { title: s.name, description: s.summary.replace(/[*_#`]/g, "").slice(0, 160) };
}

export default async function StructurePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await load(slug);
  if (!s) notFound();
  const signedIn = !!(await getUserId());

  return (
    <PageShell>
      <article className="container max-w-4xl space-y-10 py-10">
        <div className="space-y-4">
          <Link href="/atlas" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Conteúdo
          </Link>
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">{s.name}</h1>
              {s.scientificName && <p className="italic text-muted-foreground">{s.scientificName}</p>}
            </div>
            {s.hasModel && (
              <Button asChild>
                <Link href={`/viewer?s=${s.slug}`}>
                  <Box aria-hidden /> Ver no modelo 3D
                </Link>
              </Button>
            )}
          </header>
        </div>

        <section aria-labelledby="resumo" className="space-y-3">
          <h2 id="resumo" className="text-xl font-semibold">
            Resumo
          </h2>
          <SummarySection s={s} />
        </section>
        <section aria-labelledby="anatomia" className="space-y-3">
          <h2 id="anatomia" className="text-xl font-semibold">
            Anatomia
          </h2>
          <AnatomySection s={s} />
        </section>
        <section aria-labelledby="clinica" className="space-y-3">
          <h2 id="clinica" className="text-xl font-semibold">
            Clínica
          </h2>
          <ClinicalSection s={s} />
        </section>

        <StructureStudyTools slug={s.slug} name={s.name} signedIn={signedIn} questionCount={s.questionCount} flashcardCount={s.flashcardCount} />

        <p className="text-xs text-muted-foreground">
          Atualizado em {new Date(s.updatedAt).toLocaleDateString("pt-BR", { dateStyle: "long" })}. Conteúdo educacional do atlas, escrito para
          estudo — confira sempre com a bibliografia da sua disciplina.
        </p>
      </article>
    </PageShell>
  );
}
