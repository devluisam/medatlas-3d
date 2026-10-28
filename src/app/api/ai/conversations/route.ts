import { z } from "zod";
import { json, readQuery, route } from "@/server/http";
import { requireUserId } from "@/server/session";
import { listConversations } from "@/server/ai/tutor";

export const GET = route("ai/conversations", async (req) => {
  const userId = await requireUserId();
  const { structure } = readQuery(req, z.object({ structure: z.string().regex(/^[a-z0-9-]+$/).max(80).optional() }));
  return json({ conversations: await listConversations(userId, structure) });
});
