import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? "8"), 20);
  const system = req.nextUrl.searchParams.get("system");

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const where: any = {
      isPublished: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { scientificName: { contains: q, mode: "insensitive" } },
        { commonNames: { has: q } },
        { tags: { has: q.toLowerCase() } },
      ],
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
      relevanceScore: s.name.toLowerCase().startsWith(q.toLowerCase()) ? 2 : 1,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
