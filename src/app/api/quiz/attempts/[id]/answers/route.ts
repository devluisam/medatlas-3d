import { z } from "zod";
import { IdSchema, json, readJson, readParams, route } from "@/server/http";
import { requireUserId } from "@/server/session";
import { answerQuestion, AnswerSchema } from "@/server/quiz";

type Ctx = { params: Promise<{ id: string }> };

/** Grava a resposta. Correção imediata só em Prática e Casos clínicos. */
export const POST = route<Ctx>("quiz/attempts/[id]/answers", async (req, { params }) => {
  const userId = await requireUserId();
  const { id } = await readParams(params, z.object({ id: IdSchema }));
  const input = await readJson(req, AnswerSchema, 500);
  return json(await answerQuestion(userId, id, input));
});
