import { z } from "zod";
import { IdSchema, json, readParams, route } from "@/server/http";
import { requireUserId } from "@/server/session";
import { completeAttempt } from "@/server/quiz";

type Ctx = { params: Promise<{ id: string }> };

/** Finaliza e pontua no servidor. Repetir a chamada devolve o mesmo resultado. */
export const POST = route<Ctx>("quiz/attempts/[id]/complete", async (_req, { params }) => {
  const userId = await requireUserId();
  const { id } = await readParams(params, z.object({ id: IdSchema }));
  return json(await completeAttempt(userId, id));
});
