import type { Metadata } from "next";
import Link from "next/link";
import { Award, Bone, Brain, Clock, Flame, Layers, Star } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QUIZ_MODE_LABELS } from "@/lib/labels";
import { cn, formatStudyTime } from "@/lib/utils";
import { requirePageUser } from "@/server/page-auth";
import { getDashboard } from "@/server/progress";

export const metadata: Metadata = { title: "Painel", description: "Seu progresso: estruturas estudadas, quizzes, revisões e sequência." };
export const dynamic = "force-dynamic";

const WEEKDAY = new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: "UTC" });

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Clock; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border/80 bg-card/60 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden /> {label}
      </div>
      <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requirePageUser("/dashboard");
  const d = await getDashboard(user.id);
  const first = user.name.split(" ")[0];
  const fresh = d.totals.structuresViewed === 0 && d.totals.quizzesCompleted === 0 && d.totals.flashcardReviews === 0;
  const maxMinutes = Math.max(10, ...d.week.map((w) => w.minutes));

  return (
    <PageShell>
      <div className="container space-y-8 py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold">Olá, {first}</h1>
            <p className="text-muted-foreground">
              {fresh
                ? "Seu painel começa vazio e se preenche conforme você estuda."
                : d.studiedToday
                  ? "Você já estudou hoje."
                  : d.streak.current > 0
                    ? `Estude hoje para manter a sequência de ${d.streak.current} ${d.streak.current === 1 ? "dia" : "dias"}.`
                    : "Nenhum estudo registrado hoje."}
            </p>
          </div>
          <div className="w-full max-w-xs space-y-1.5">
            <div className="flex items-baseline justify-between text-sm">
              <span>
                Nível {d.level.level} · <span className="text-muted-foreground">{d.level.title}</span>
              </span>
              <span className="tabular-nums text-muted-foreground">{d.xp.toLocaleString("pt-BR")} XP</span>
            </div>
            <Progress value={d.level.progress} className="h-2" aria-label="Progresso até o próximo nível" />
            {d.level.xpForNext !== null && (
              <p className="text-xs text-muted-foreground">{d.level.xpForNext.toLocaleString("pt-BR")} XP para o próximo nível</p>
            )}
          </div>
        </header>

        {fresh && (
          <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
            <h2 className="text-lg font-semibold">Por onde começar</h2>
            <ol className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                { href: "/viewer", icon: Bone, title: "Explore o esqueleto", text: "Clique num osso e abra o painel de estudo." },
                { href: "/quiz", icon: Brain, title: "Faça um quiz", text: "10 questões em modo Prática, com correção na hora." },
                { href: "/flashcards", icon: Layers, title: "Revise cartões", text: "A repetição espaçada agenda as próximas revisões." },
              ].map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="block h-full rounded-xl border border-border/80 bg-card/70 p-4 hover:border-primary/50">
                    <s.icon className="h-5 w-5 text-primary" aria-hidden />
                    <span className="mt-2 block font-medium">{s.title}</span>
                    <span className="block text-sm text-muted-foreground">{s.text}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section aria-label="Resumo" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Stat icon={Flame} label="Sequência" value={`${d.streak.current} ${d.streak.current === 1 ? "dia" : "dias"}`} hint={`Recorde: ${d.streak.longest}`} />
          <Stat icon={Clock} label="Tempo de estudo" value={formatStudyTime(d.totals.studySeconds)} hint="com o painel de estudo aberto" />
          <Stat icon={Bone} label="Estruturas estudadas" value={String(d.totals.structuresViewed)} />
          <Stat
            icon={Brain}
            label="Quizzes"
            value={String(d.totals.quizzesCompleted)}
            hint={d.totals.averageScore === null ? "nenhum finalizado" : `média de ${d.totals.averageScore}%`}
          />
          <Stat
            icon={Layers}
            label="Revisões"
            value={String(d.totals.flashcardReviews)}
            hint={d.totals.flashcardsDue ? `${d.totals.flashcardsDue} vencidas agora` : "nenhuma vencida"}
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card/40 p-5">
            <h2 className="font-semibold">Últimos 7 dias</h2>
            <figure>
              <div className="flex h-36 items-end gap-2" role="img" aria-label={d.week.map((w) => `${w.date}: ${w.minutes} min`).join("; ")}>
                {d.week.map((w, i) => (
                  <div key={w.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="text-[10px] tabular-nums text-muted-foreground">{w.minutes > 0 ? `${w.minutes}m` : ""}</span>
                    <div
                      className={cn("w-full max-w-10 rounded-t-md", w.minutes > 0 || w.activities > 0 ? "bg-primary/70" : "bg-muted")}
                      style={{ height: `${Math.max(4, (w.minutes / maxMinutes) * 100)}%` }}
                    />
                    <span className={cn("text-[11px] text-muted-foreground", i === 6 && "font-medium text-foreground")}>
                      {i === 6 ? "hoje" : WEEKDAY.format(new Date(`${w.date}T12:00:00Z`)).replace(".", "")}
                    </span>
                  </div>
                ))}
              </div>
              <figcaption className="mt-2 text-xs text-muted-foreground">Minutos com o painel de estudo aberto. Dia com qualquer atividade conta para a sequência.</figcaption>
            </figure>
          </section>

          <section className="space-y-3 rounded-2xl border border-border/80 bg-card/40 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Continuar estudando</h2>
              <Link href="/atlas" className="text-sm text-primary underline-offset-2 hover:underline">
                Conteúdo
              </Link>
            </div>
            {d.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">As estruturas que você abrir aparecem aqui.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {d.recent.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/viewer?s=${r.slug}`} className="flex items-center justify-between gap-3 py-2 text-sm hover:text-primary">
                      <span className="min-w-0">
                        <span className="block truncate">{r.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {r.system} · {formatStudyTime(r.studySeconds)}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{new Date(r.lastViewed).toLocaleDateString("pt-BR")}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card/40 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Quizzes recentes</h2>
              <Button asChild size="sm" variant="outline">
                <Link href="/quiz">Novo quiz</Link>
              </Button>
            </div>
            {d.attempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum quiz finalizado ainda.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {d.attempts.map((a) => (
                  <li key={a.id}>
                    <Link href={`/quiz/${a.id}`} className="flex items-center justify-between py-2 text-sm hover:text-primary">
                      <span>
                        {QUIZ_MODE_LABELS[a.mode]}
                        <span className="block text-xs text-muted-foreground">
                          {a.correctQ}/{a.totalQ} corretas · {new Date(a.completedAt).toLocaleDateString("pt-BR")}
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

          <section className="space-y-3 rounded-2xl border border-border/80 bg-card/40 p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <Star className="h-4 w-4 text-warning" aria-hidden /> Favoritos
            </h2>
            {d.favorites.length === 0 ? (
              <p className="text-sm text-muted-foreground">Use a estrela no painel de estudo para guardar estruturas aqui.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {d.favorites.map((f) => (
                  <li key={f.slug}>
                    <Link href={`/atlas/${f.slug}`} className="inline-block rounded-full border border-border px-3 py-1 text-sm hover:border-primary/50">
                      {f.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-semibold">
            <Award className="h-4 w-4 text-primary" aria-hidden /> Conquistas
            <span className="text-sm font-normal text-muted-foreground">
              {d.achievements.filter((a) => a.unlockedAt).length} de {d.achievements.length}
            </span>
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {d.achievements.map((a) => (
              <li
                key={a.slug}
                className={cn("rounded-xl border p-4", a.unlockedAt ? "border-primary/40 bg-primary/5" : "border-border/80 bg-card/40")}
              >
                <p className={cn("font-medium", !a.unlockedAt && "text-foreground/80")}>{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Progress value={a.progress} className="h-1.5 flex-1" aria-label={`Progresso de ${a.name}`} />
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString("pt-BR") : `${a.progress}%`}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">+{a.xpReward} XP</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
