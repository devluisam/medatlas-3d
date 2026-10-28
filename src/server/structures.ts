import "server-only";
import { z } from "zod";
import { BodyRegion, StructureCategory, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { normalizeForSearch } from "@/lib/search-text";
import { hasModelMesh } from "@/lib/anatomy/skeleton-map";
import { SYSTEM_KEYS } from "@/lib/labels";
import { notFound } from "./http";

export const StructureFiltersSchema = z.object({
  q: z.string().trim().max(80).optional(),
  system: z.enum(SYSTEM_KEYS).optional(),
  region: z.nativeEnum(BodyRegion).optional(),
  category: z.nativeEnum(StructureCategory).optional(),
  model: z.enum(["with", "without"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(100),
});
export type StructureFilters = z.infer<typeof StructureFiltersSchema>;

const LIST_SELECT = {
  slug: true,
  name: true,
  scientificName: true,
  category: true,
  system: true,
  region: true,
  difficulty: true,
  summary: true,
} satisfies Prisma.AnatomicalStructureSelect;

export type StructureListItem = Prisma.AnatomicalStructureGetPayload<{ select: typeof LIST_SELECT }> & {
  hasModel: boolean;
};

export async function listStructures(filters: Partial<StructureFilters> = {}): Promise<StructureListItem[]> {
  const where: Prisma.AnatomicalStructureWhereInput = { isPublished: true };
  if (filters.q && filters.q.length >= 2) where.searchText = { contains: normalizeForSearch(filters.q) };
  if (filters.system) where.system = filters.system;
  if (filters.region) where.region = filters.region;
  if (filters.category) where.category = filters.category;

  const rows = await prisma.anatomicalStructure.findMany({
    where,
    select: LIST_SELECT,
    orderBy: { name: "asc" },
    take: filters.limit ?? 100,
  });

  let items = rows.map((r) => ({ ...r, hasModel: hasModelMesh(r.slug) }));
  if (filters.model === "with") items = items.filter((i) => i.hasModel);
  if (filters.model === "without") items = items.filter((i) => !i.hasModel);

  // Quem começa com o termo aparece primeiro ("fem" → Fêmur antes de Nervo femoral)
  if (filters.q && filters.q.length >= 2) {
    const term = normalizeForSearch(filters.q);
    items.sort((a, b) => {
      const sa = normalizeForSearch(a.name).startsWith(term) ? 0 : 1;
      const sb = normalizeForSearch(b.name).startsWith(term) ? 0 : 1;
      return sa - sb || a.name.localeCompare(b.name, "pt-BR");
    });
  }
  return items;
}

const DETAIL_SELECT = {
  id: true,
  slug: true,
  name: true,
  scientificName: true,
  commonNames: true,
  category: true,
  system: true,
  region: true,
  side: true,
  summary: true,
  anatomyDetail: true,
  physiology: true,
  histology: true,
  embryology: true,
  bloodSupply: true,
  venousDrainage: true,
  lymphDrainage: true,
  innervation: true,
  clinicalNotes: true,
  surgicalNotes: true,
  tags: true,
  difficulty: true,
  updatedAt: true,
  pathologies: {
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      icd10Code: true,
      description: true,
      symptoms: true,
      diagnosis: true,
      treatment: true,
      prognosis: true,
    },
  },
  _count: {
    select: {
      questions: { where: { isActive: true, origin: "CURATED" } },
      flashcards: { where: { origin: "CURATED", setId: null } },
    },
  },
} satisfies Prisma.AnatomicalStructureSelect;

type DetailRow = Prisma.AnatomicalStructureGetPayload<{ select: typeof DETAIL_SELECT }>;

export type StructureDetail = Omit<DetailRow, "id" | "_count" | "updatedAt"> & {
  hasModel: boolean;
  questionCount: number;
  flashcardCount: number;
  updatedAt: string;
};

export async function getStructure(slug: string): Promise<StructureDetail> {
  const row = await prisma.anatomicalStructure.findFirst({
    where: { slug, isPublished: true },
    select: DETAIL_SELECT,
  });
  if (!row) throw notFound("Estrutura");
  const { id: _id, _count, updatedAt, ...rest } = row;
  return {
    ...rest,
    hasModel: hasModelMesh(row.slug),
    questionCount: _count.questions,
    flashcardCount: _count.flashcards,
    updatedAt: updatedAt.toISOString(),
  };
}

/** ID interno a partir do slug (para gravações). */
export async function structureIdBySlug(slug: string): Promise<string> {
  const row = await prisma.anatomicalStructure.findFirst({
    where: { slug, isPublished: true },
    select: { id: true },
  });
  if (!row) throw notFound("Estrutura");
  return row.id;
}
