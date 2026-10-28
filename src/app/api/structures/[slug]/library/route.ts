import { z } from "zod";
import { json, readJson, readParams, route, SlugSchema } from "@/server/http";
import { requireUserId } from "@/server/session";
import { getStructureLibrary, NoteSchema, saveNote, setFavorite } from "@/server/library";

type Ctx = { params: Promise<{ slug: string }> };
const Params = z.object({ slug: SlugSchema });

/** Favorito e anotação do usuário logado para esta estrutura. */
export const GET = route<Ctx>("structures/[slug]/library", async (_req, { params }) => {
  const userId = await requireUserId();
  const { slug } = await readParams(params, Params);
  return json(await getStructureLibrary(userId, slug));
});

const PatchSchema = z
  .object({ favorite: z.boolean().optional(), note: NoteSchema.shape.content.optional() })
  .refine((v) => v.favorite !== undefined || v.note !== undefined, "Nada para salvar");

export const PATCH = route<Ctx>("structures/[slug]/library", async (req, { params }) => {
  const userId = await requireUserId();
  const { slug } = await readParams(params, Params);
  const body = await readJson(req, PatchSchema, 24_000);
  if (body.favorite !== undefined) await setFavorite(userId, slug, body.favorite);
  if (body.note !== undefined) await saveNote(userId, slug, body.note);
  return json(await getStructureLibrary(userId, slug));
});
