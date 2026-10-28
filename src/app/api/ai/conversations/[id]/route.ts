import { z } from "zod";
import { IdSchema, json, readParams, route } from "@/server/http";
import { requireUserId } from "@/server/session";
import { deleteConversation, getConversation } from "@/server/ai/tutor";

type Ctx = { params: Promise<{ id: string }> };
const Params = z.object({ id: IdSchema });

export const GET = route<Ctx>("ai/conversations/[id]", async (_req, { params }) => {
  const userId = await requireUserId();
  const { id } = await readParams(params, Params);
  return json(await getConversation(userId, id));
});

export const DELETE = route<Ctx>("ai/conversations/[id]", async (_req, { params }) => {
  const userId = await requireUserId();
  const { id } = await readParams(params, Params);
  await deleteConversation(userId, id);
  return json({ ok: true });
});
