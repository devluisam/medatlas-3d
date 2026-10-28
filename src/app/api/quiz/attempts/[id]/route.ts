import { z } from "zod";
import { IdSchema, json, readParams, route } from "@/server/http";
import { requireUserId } from "@/server/session";
import { getAttemptView } from "@/server/quiz";

type Ctx = { params: Promise<{ id: string }> };

/** Estado do quiz para retomar após recarregar a página. */
export const GET = route<Ctx>("quiz/attempts/[id]", async (_req, { params }) => {
  const userId = await requireUserId();
  const { id } = await readParams(params, z.object({ id: IdSchema }));
  return json(await getAttemptView(userId, id));
});
