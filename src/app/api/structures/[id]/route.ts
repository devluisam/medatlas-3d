import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const structure = await prisma.anatomicalStructure.findFirst({
      where: {
        OR: [{ id }, { slug: id }, { modelId: id }],
        isPublished: true,
      },
      select: {
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
        trivia: true,
        modelId: true,
        thumbnailUrl: true,
        imageUrls: true,
        tags: true,
        difficulty: true,
      },
    });

    if (!structure) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(structure);
  } catch (error) {
    console.error("Structure fetch error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
