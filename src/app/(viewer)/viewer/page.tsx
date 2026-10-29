import type { Metadata } from "next";
import { Suspense } from "react";
import { ViewerLayout } from "@/components/viewer/ViewerLayout";
import { listStructures } from "@/server/structures";

export const metadata: Metadata = {
  title: "Atlas 3D",
  description: "Esqueleto humano em 3D: gire, corte, isole ossos e estude cada estrutura com conteúdo, questões e flashcards.",
};

// Lê o banco a cada requisição: o build não depende de banco
export const dynamic = "force-dynamic";

export default async function ViewerPage() {
  const structures = await listStructures();
  return (
    <Suspense>
      <ViewerLayout structures={structures} />
    </Suspense>
  );
}
