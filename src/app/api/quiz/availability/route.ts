import { z } from "zod";
import { SYSTEM_KEYS } from "@/lib/labels";
import { isAiConfigured } from "@/lib/config";
import { json, readQuery, route } from "@/server/http";
import { countBankQuestions } from "@/server/quiz";

const Query = z.object({
  mode: z.enum(["PRACTICE", "TIMED", "EXAM", "CLINICAL"]).default("PRACTICE"),
  difficulty: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional(),
  systems: z
    .string()
    .max(400)
    .optional()
    .transform((v) => (v ? v.split(",").filter(Boolean) : []))
    .pipe(z.array(z.enum(SYSTEM_KEYS))),
});

/** Quantas questões do banco atendem aos filtros e se a geração por IA está ligada. */
export const GET = route("quiz/availability", async (req) => {
  const q = readQuery(req, Query);
  const bankCount = await countBankQuestions({ mode: q.mode, difficulty: q.difficulty ?? null, systems: q.systems });
  return json({ bankCount, aiAvailable: isAiConfigured() });
});
