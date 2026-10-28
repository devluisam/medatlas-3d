import { z } from "zod";
import { IdSchema, json, readJson, readParams, route } from "@/server/http";
import { requireUserId } from "@/server/session";
import { setFlag } from "@/server/quiz";

type Ctx = { params: Promise<{ id: string }> };

/** Marca uma questão para revisar antes de finalizar. */
export const POST = route<Ctx>("quiz/attempts/[id]/flag", async (req, { params }) => {
  const userId = await requireUserId();
  const { id } = await readParams(params, z.object({ id: IdSchema }));
  const { questionId, flagged } = await readJson(
    req,
    z.object({ questionId: z.string().min(1).max(40), flagged: z.boolean() }),
    300
  );
  await setFlag(userId, id, questionId, flagged);
  return json({ ok: true });
});
