import { json, readJson, route } from "@/server/http";
import { requireUserId } from "@/server/session";
import { createAttempt, CreateAttemptSchema, listAttempts } from "@/server/quiz";

export const GET = route("quiz/attempts", async () => {
  const userId = await requireUserId();
  return json({ attempts: await listAttempts(userId) });
});

/** Cria um quiz com questões do banco ou geradas por IA. A resposta não traz gabarito. */
export const POST = route("quiz/attempts", async (req) => {
  const userId = await requireUserId();
  const input = await readJson(req, CreateAttemptSchema, 2_000);
  return json(await createAttempt(userId, input), { status: 201 });
});
