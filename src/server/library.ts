import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { structureIdBySlug } from "./structures";

/** Favoritos e anotações por estrutura. Sempre filtrados pelo usuário da sessão. */

export async function getStructureLibrary(userId: string, slug: string) {
  const structureId = await structureIdBySlug(slug);
  const [favorite, note] = await Promise.all([
    prisma.favoriteStructure.findUnique({ where: { userId_structureId: { userId, structureId } }, select: { id: true } }),
    prisma.studyNote.findUnique({
      where: { userId_structureId: { userId, structureId } },
      select: { content: true, updatedAt: true },
    }),
  ]);
  return {
    favorite: !!favorite,
    note: note ? { content: note.content, updatedAt: note.updatedAt.toISOString() } : null,
  };
}

export async function setFavorite(userId: string, slug: string, favorite: boolean) {
  const structureId = await structureIdBySlug(slug);
  if (favorite) {
    await prisma.favoriteStructure.upsert({
      where: { userId_structureId: { userId, structureId } },
      create: { userId, structureId },
      update: {},
    });
  } else {
    await prisma.favoriteStructure.deleteMany({ where: { userId, structureId } });
  }
  return { favorite };
}

export async function listFavorites(userId: string) {
  const rows = await prisma.favoriteStructure.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { structure: { select: { slug: true, name: true, system: true, category: true } } },
  });
  return rows.map((r) => r.structure);
}

export const MAX_NOTE_CHARS = 10_000;
export const NoteSchema = z.object({ content: z.string().max(MAX_NOTE_CHARS, `Máximo de ${MAX_NOTE_CHARS} caracteres.`) });

/** Salva a anotação; conteúdo vazio apaga. */
export async function saveNote(userId: string, slug: string, content: string) {
  const structureId = await structureIdBySlug(slug);
  const trimmed = content.trim();
  if (!trimmed) {
    await prisma.studyNote.deleteMany({ where: { userId, structureId } });
    return { note: null };
  }
  const structure = await prisma.anatomicalStructure.findUniqueOrThrow({ where: { id: structureId }, select: { name: true } });
  const note = await prisma.studyNote.upsert({
    where: { userId_structureId: { userId, structureId } },
    create: { userId, structureId, title: structure.name, content: trimmed },
    update: { content: trimmed },
    select: { content: true, updatedAt: true },
  });
  return { note: { content: note.content, updatedAt: note.updatedAt.toISOString() } };
}
