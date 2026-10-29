import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { QuizSetup } from "@/components/quiz/QuizSetup";
import { QUIZ_MODE_LABELS } from "@/lib/labels";
import { requirePageUser } from "@/server/page-auth";
import { listAttempts } from "@/server/quiz";

export const metadata: Metadata = {
  title: "Quiz",
  description: "Questões comentadas de anatomia por sistema e dificuldade, corrigidas no servidor.",
};

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const user = await requirePageUser("/quiz");
  const attempts = await listAttempts(user.id, 8);
  const open = attempts.filter((a) => !a.completedAt);
  const done = attempts.filter((a) => a.completedAt);

  return (
    <PageShell>
      <div className="container grid gap-10 py-10 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-6">
          <header className="space-y-1">
            <h1 className="text-3xl font-semibold">Quiz</h1>
            <p className="text-muted-foreground">Monte um quiz com as questões do atlas. Resultado, XP e histórico ficam no seu painel.</p>
          </header>
          <QuizSetup />
        </div>

        <aside className="space-y-6">
          {open.length > 0 && (
            <section className="space-y-2">
              <h2 className="eyebrow">Em andamento</h2>
              <ul className="space-y-1.5">
                {open.map((a) => (
                  <li key={a.id}>
                    <Link href={`/quiz/${a.id}`} className="block rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-sm hover:bg-primary/10">
                      {QUIZ_MODE_LABELS[a.mode]} · {a.totalQ} questões
                      <span className="block text-xs text-muted-foreground">
                        iniciado em {a.startedAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} — continuar
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="space-y-2">
            <h2 className="eyebrow">Últimos resultados</h2>
            {done.length === 0 ? (
              <p className="text-sm text-muted-foreground">Você ainda não finalizou nenhum quiz.</p>
            ) : (
              <ul className="space-y-1.5">
                {done.map((a) => (
                  <li key={a.id}>
                    <Link href={`/quiz/${a.id}`} className="flex items-center justify-between rounded-lg border border-border/80 px-3 py-2 text-sm hover:bg-accent/50">
                      <span>
                        {QUIZ_MODE_LABELS[a.mode]}
                        <span className="block text-xs text-muted-foreground">
                          {a.correctQ}/{a.totalQ} · {a.completedAt!.toLocaleDateString("pt-BR")}
                          {a.source === "AI" && " · IA"}
                        </span>
                      </span>
                      <span className="font-display text-lg tabular-nums">{a.score}%</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
