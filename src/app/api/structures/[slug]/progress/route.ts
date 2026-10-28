import { z } from "zod";
import { json, readJson, readParams, route, SlugSchema } from "@/server/http";
import { requireUserId } from "@/server/session";
import { recordStructureView, recordStudyHeartbeat } from "@/server/progress";

type Ctx = { params: Promise<{ slug: string }> };

/**
 * `view`: abriu a estrutura. `heartbeat`: continua estudando (a cada 30 s com
 * a aba visível). O servidor decide quanto tempo creditar.
 */
export const POST = route<Ctx>("structures/[slug]/progress", async (req, { params }) => {
  const userId = await requireUserId();
  const { slug } = await readParams(params, z.object({ slug: SlugSchema }));
  const { event } = await readJson(req, z.object({ event: z.enum(["view", "heartbeat"]) }), 200);
  if (event === "view") {
    await recordStructureView(userId, slug);
    return json({ ok: true });
  }
  return json(await recordStudyHeartbeat(userId, slug));
});
