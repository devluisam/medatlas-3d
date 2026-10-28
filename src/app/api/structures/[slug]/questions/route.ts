import { z } from "zod";
import { json, readParams, readQuery, route, SlugSchema } from "@/server/http";
import { listStructureQuestions } from "@/server/quiz";

type Ctx = { params: Promise<{ slug: string }> };

/** Questões do banco ligadas à estrutura, sem gabarito (corrigidas em /api/questions/[id]/check). */
export const GET = route<Ctx>("structures/[slug]/questions", async (req, { params }) => {
  const { slug } = await readParams(params, z.object({ slug: SlugSchema }));
  const { limit } = readQuery(req, z.object({ limit: z.coerce.number().int().min(1).max(20).default(10) }));
  return json({ questions: await listStructureQuestions(slug, limit) });
});
