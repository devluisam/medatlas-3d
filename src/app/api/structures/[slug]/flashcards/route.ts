import { z } from "zod";
import { json, readParams, route, SlugSchema } from "@/server/http";
import { getUserId } from "@/server/session";
import { listStructureCards } from "@/server/flashcards";

type Ctx = { params: Promise<{ slug: string }> };

/** Cartões públicos da estrutura; com sessão, inclui o agendamento do próprio usuário. */
export const GET = route<Ctx>("structures/[slug]/flashcards", async (_req, { params }) => {
  const { slug } = await readParams(params, z.object({ slug: SlugSchema }));
  const userId = await getUserId();
  return json({ cards: await listStructureCards(slug, userId), signedIn: !!userId });
});
