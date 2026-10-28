import { readJson, route } from "@/server/http";
import { requireUserId } from "@/server/session";
import { ChatRequestSchema, streamTutorReply } from "@/server/ai/tutor";

// Node (não Edge): precisa de sessão, Prisma e da cota gravada no banco
export const runtime = "nodejs";
export const maxDuration = 60;

/** Tutor de IA em streaming (SSE). Exige conta; sujeito à cota diária. */
export const POST = route("ai/chat", async (req) => {
  const userId = await requireUserId();
  const input = await readJson(req, ChatRequestSchema, 8_000);
  return streamTutorReply(userId, input, req.signal);
});
