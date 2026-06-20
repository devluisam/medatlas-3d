import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "5");

  try {
    const structure = await prisma.anatomicalStructure.findFirst({
      where: { OR: [{ id }, { slug: id }, { modelId: id }] },
      select: { id: true },
    });

    if (!structure) return NextResponse.json([]);

    const questions = await prisma.question.findMany({
      where: { structureId: structure.id, isActive: true },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json([]);
  }
}
