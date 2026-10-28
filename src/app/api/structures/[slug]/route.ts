import { z } from "zod";
import { json, readParams, route, SlugSchema } from "@/server/http";
import { getStructure } from "@/server/structures";

type Ctx = { params: Promise<{ slug: string }> };

export const GET = route<Ctx>("structures/[slug]", async (_req, { params }) => {
  const { slug } = await readParams(params, z.object({ slug: SlugSchema }));
  return json(await getStructure(slug));
});
