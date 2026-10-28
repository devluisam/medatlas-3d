import { z } from "zod";
import { IdSchema, json, readJson, readParams, route } from "@/server/http";
import { getUserId } from "@/server/session";
import { checkStandaloneAnswer } from "@/server/quiz";

type Ctx = { params: Promise<{ id: string }> };

/** Corrige uma questão avulsa (modo estudo): o gabarito só sai depois da resposta. */
export const POST = route<Ctx>("questions/[id]/check", async (req, { params }) => {
  const { id } = await readParams(params, z.object({ id: IdSchema }));
  const { optionId } = await readJson(req, z.object({ optionId: z.string().min(1).max(8) }), 200);
  return json(await checkStandaloneAnswer(id, optionId, await getUserId()));
});
