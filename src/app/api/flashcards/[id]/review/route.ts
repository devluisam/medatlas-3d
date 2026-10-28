import { z } from "zod";
import { IdSchema, json, readJson, readParams, route } from "@/server/http";
import { requireUserId } from "@/server/session";
import { reviewCard, ReviewSchema } from "@/server/flashcards";

type Ctx = { params: Promise<{ id: string }> };

/** Avaliação de um cartão (nota SM-2 de 0 a 5), gravada no agendamento do usuário. */
export const POST = route<Ctx>("flashcards/[id]/review", async (req, { params }) => {
  const userId = await requireUserId();
  const { id } = await readParams(params, z.object({ id: IdSchema }));
  const { grade } = await readJson(req, ReviewSchema, 100);
  return json(await reviewCard(userId, id, grade));
});
