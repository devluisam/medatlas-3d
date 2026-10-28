import { json, readQuery, route } from "@/server/http";
import { listStructures, StructureFiltersSchema } from "@/server/structures";

/** Lista pública de estruturas, com busca (sem acento) e filtros. */
export const GET = route("structures", async (req) => {
  const filters = readQuery(req, StructureFiltersSchema);
  return json({ structures: await listStructures(filters) });
});
