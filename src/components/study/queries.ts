"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { StructureDetail, StructureListItem } from "@/server/structures";
import type { CardView } from "@/server/flashcards";
import type { PublicQuestion } from "@/lib/quiz/questions";

/** Chaves e consultas do React Query usadas por mais de uma tela. */

export const keys = {
  structure: (slug: string) => ["structure", slug] as const,
  structures: (params: string) => ["structures", params] as const,
  questions: (slug: string) => ["structure-questions", slug] as const,
  cards: (slug: string) => ["structure-cards", slug] as const,
  library: (slug: string) => ["structure-library", slug] as const,
  aiStatus: ["ai-status"] as const,
  queue: (structure?: string) => ["flashcard-queue", structure ?? "all"] as const,
  conversations: (slug?: string) => ["conversations", slug ?? "all"] as const,
};

export function useStructure(slug: string | null) {
  return useQuery({
    queryKey: keys.structure(slug ?? ""),
    queryFn: () => apiFetch<StructureDetail>(`/api/structures/${slug}`),
    enabled: !!slug,
  });
}

export function useStructureList(params = "") {
  return useQuery({
    queryKey: keys.structures(params),
    queryFn: () => apiFetch<{ structures: StructureListItem[] }>(`/api/structures${params ? `?${params}` : ""}`),
    select: (d) => d.structures,
    staleTime: 10 * 60_000,
  });
}

export function useStructureQuestions(slug: string) {
  return useQuery({
    queryKey: keys.questions(slug),
    queryFn: () => apiFetch<{ questions: PublicQuestion[] }>(`/api/structures/${slug}/questions`),
    select: (d) => d.questions,
  });
}

export function useStructureCards(slug: string) {
  return useQuery({
    queryKey: keys.cards(slug),
    queryFn: () => apiFetch<{ cards: CardView[]; signedIn: boolean }>(`/api/structures/${slug}/flashcards`),
  });
}

export interface AiStatus {
  available: boolean;
  signedIn: boolean;
  chat: { used: number; limit: number; remaining: number } | null;
}

export function useAiStatus() {
  return useQuery({ queryKey: keys.aiStatus, queryFn: () => apiFetch<AiStatus>("/api/ai/status"), staleTime: 30_000 });
}
