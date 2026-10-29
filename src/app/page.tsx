import Link from "next/link";
import { ArrowRight, Bone, Brain, Layers, Scissors, Sparkles, Stethoscope } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { MODEL_STRUCTURE_SLUGS } from "@/lib/anatomy/skeleton-map";

export const dynamic = "force-dynamic";

/** Números reais do banco; se o banco estiver fora, a página abre sem eles. */
async function counts() {
  try {
    const [structures, questions, flashcards] = await Promise.all([
      prisma.anatomicalStructure.count({ where: { isPublished: true } }),
      prisma.question.count({ where: { isActive: true, origin: "CURATED" } }),
      prisma.flashcard.count({ where: { origin: "CURATED", setId: null } }),
    ]);
    return { structures, questions, flashcards };
  } catch {
    return null;
  }
}

const FEATURES = [
  {
    icon: Bone,
    title: "Esqueleto 3D navegável",
    text: "Gire, aproxime, isole e oculte ossos. Clique numa peça para ver o nome e abrir a ficha de estudo.",
  },
  {
    icon: Scissors,
    title: "Cortes e raio-X",
    text: "Planos sagital, coronal e transversal com corte real da malha, e modo translúcido para ver o que está atrás.",
  },
  {
    icon: Stethoscope,
    title: "Conteúdo por estrutura",
    text: "Anatomia descritiva, irrigação, inervação e correlações clínicas, também acessíveis sem 3D.",
  },
  {
    icon: Brain,
    title: "Quiz corrigido no servidor",
    text: "Prática com explicação na hora, simulado e modo cronometrado. O gabarito não vai para o navegador antes da hora.",
  },
  {
    icon: Layers,
    title: "Flashcards com SM-2",
    text: "Repetição espaçada com agendamento individual: cada nota reprograma o cartão só para você.",
  },
  {
    icon: Sparkles,
    title: "Tutor de IA opcional",
    text: "Tira dúvidas usando o conteúdo do atlas como referência, com limite diário e aviso de conteúdo gerado.",
  },
];

export default async function HomePage() {
  const n = await counts();
  const stats = n
    ? [
        { value: String(MODEL_STRUCTURE_SLUGS.length), label: "estruturas ósseas no modelo 3D" },
        { value: String(n.structures), label: "fichas de estudo" },
        { value: String(n.questions), label: "questões comentadas" },
        { value: String(n.flashcards), label: "flashcards" },
      ]
    : null;

  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_0%,hsl(var(--primary)/0.16),transparent_70%)]"
        />
        <div className="container relative grid gap-12 py-20 md:py-28 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-6">
            <p className="eyebrow">Atlas de anatomia no navegador</p>
            <h1 className="text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              Estude o esqueleto em 3D e fixe com questões e revisão espaçada.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Cada osso do modelo leva a uma ficha de estudo com anatomia, clínica, questões e flashcards. Sem instalar nada, de graça.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/viewer">
                  Abrir o atlas 3D <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/atlas">Ver o conteúdo</Link>
              </Button>
            </div>
          </div>

          {stats && (
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/80 bg-border/80">
              {stats.map((s) => (
                <div key={s.label} className="bg-card/90 p-6">
                  <dt className="text-sm text-muted-foreground">{s.label}</dt>
                  <dd className="order-first font-display text-4xl font-semibold tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <section className="container py-20">
        <h2 className="max-w-xl text-2xl font-semibold sm:text-3xl">O que existe hoje</h2>
        <ul className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="space-y-2">
              <f.icon className="h-5 w-5 text-primary" aria-hidden />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-border/60 bg-card/30">
        <div className="container grid gap-8 py-16 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">O que ainda não existe</h2>
            <p className="text-muted-foreground">
              O modelo 3D atual é só o esqueleto. Músculos, órgãos, vasos e nervos têm ficha de estudo em texto, questões e flashcards, mas
              ainda não aparecem em 3D — e a interface diz isso onde importa.
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Para quem é</h2>
            <p className="text-muted-foreground">
              Estudantes de graduação na área da saúde revisando anatomia. É material de apoio: não substitui livro-texto, aula prática nem
              orientação profissional.
            </p>
          </div>
        </div>
      </section>

      <section className="container flex flex-col items-start gap-4 py-20 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Comece pelo fêmur.</h2>
          <p className="text-muted-foreground">O maior osso do corpo, com ficha, questões e cartões prontos.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/viewer?s=femur">
            Abrir o fêmur em 3D <ArrowRight aria-hidden />
          </Link>
        </Button>
      </section>
    </PageShell>
  );
}
