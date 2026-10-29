import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { QuizSession } from "@/components/quiz/QuizSession";
import { IdSchema } from "@/server/http";
import { requirePageUser } from "@/server/page-auth";

export const metadata: Metadata = { title: "Quiz", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function QuizAttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!IdSchema.safeParse(id).success) notFound();
  await requirePageUser(`/quiz/${id}`);
  return (
    <PageShell>
      <div className="container max-w-5xl py-8">
        <QuizSession attemptId={id} />
      </div>
    </PageShell>
  );
}
