import { isAiConfigured } from "@/lib/config";
import { json, route } from "@/server/http";
import { getUserId } from "@/server/session";
import { aiUsageToday } from "@/server/ai/quota";

/** Se a IA está ligada nesta instalação e, para quem está logado, a cota restante. */
export const GET = route("ai/status", async () => {
  const available = isAiConfigured();
  const userId = await getUserId();
  return json({
    available,
    signedIn: !!userId,
    chat: available && userId ? await aiUsageToday(userId, "CHAT") : null,
  });
});
