import { json, readQuery, route } from "@/server/http";
import { requireUserId } from "@/server/session";
import { QueueQuerySchema, reviewQueue } from "@/server/flashcards";

/** Cartões vencidos do usuário e, se houver espaço, cartões novos. */
export const GET = route("flashcards/queue", async (req) => {
  const userId = await requireUserId();
  return json(await reviewQueue(userId, readQuery(req, QueueQuerySchema)));
});
