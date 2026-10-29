import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { FlashcardQueue } from "@/components/study/FlashcardQueue";
import { requirePageUser } from "@/server/page-auth";

export const metadata: Metadata = { title: "Flashcards", description: "Revisão com repetição espaçada (SM-2)." };
export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
  await requirePageUser("/flashcards");
  return (
    <PageShell>
      <div className="container max-w-2xl space-y-6 py-10">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold">Flashcards</h1>
          <p className="text-muted-foreground">
            Repetição espaçada (SM-2): cada nota que você dá reagenda o cartão só para você. Quanto melhor você lembra, mais o intervalo
            cresce.
          </p>
        </header>
        <FlashcardQueue />
      </div>
    </PageShell>
  );
}
