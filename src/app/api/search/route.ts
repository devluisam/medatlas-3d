import { z } from "zod";
import { json, readQuery, route } from "@/server/http";
import { listStructures } from "@/server/structures";
import { SYSTEM_KEYS } from "@/lib/labels";

const Query = z.object({
  q: z.string().trim().max(80).default(""),
  limit: z.coerce.number().int().min(1).max(20).default(8),
  system: z.enum(SYSTEM_KEYS).optional(),
});

/** Busca rápida da paleta (Ctrl+K). Abaixo de 2 caracteres não consulta o banco. */
export const GET = route("search", async (req) => {
  const { q, limit, system } = readQuery(req, Query);
  if (q.length < 2) return json({ results: [] });
  const results = await listStructures({ q, system, limit });
  return json({ results });
});
