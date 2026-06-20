import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const structure = await prisma.anatomicalStructure.findFirst({
      where: { OR: [{ id }, { slug: id }, { modelId: id }] },
      select: { id: true },
    });

    if (!structure) {
      return NextResponse.json([], { status: 200 });
    }

    const pathologies = await prisma.structurePathology.findMany({
      where: { structureId: structure.id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(pathologies);
  } catch (error) {
    console.error("Pathologies fetch error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
