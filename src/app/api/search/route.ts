import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeForSearch } from "@/lib/search-text";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? "8"), 20);
  const system = req.nextUrl.searchParams.get("system");

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Busca no texto normalizado: "femur" e "fêmur" chegam ao mesmo lugar.
    const termo = normalizeForSearch(q);
    const where: any = {
      isPublished: true,
      searchText: { contains: termo },
    };

    if (system) {
      where.system = system.toUpperCase();
    }

    const structures = await prisma.anatomicalStructure.findMany({
      where,
      take: limit,
      select: {
        id: true,
        slug: true,
        name: true,
        scientificName: true,
        category: true,
        system: true,
        region: true,
        thumbnailUrl: true,
      },
      orderBy: [{ name: "asc" }],
    });

    const results = structures.map((s) => ({
      ...s,
      relevanceScore: normalizeForSearch(s.name).startsWith(termo) ? 2 : 1,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
