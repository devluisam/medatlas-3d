"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const HEARTBEAT_MS = 30_000;

function post(slug: string, event: "view" | "heartbeat") {
  return fetch(`/api/structures/${slug}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
    keepalive: true,
  }).catch(() => undefined);
}

/**
 * Registra a abertura da estrutura e, a cada 30 s com a aba visível, um pulso
 * de tempo de estudo. Quem decide quanto creditar é o servidor.
 */
export function useStudyTracking(slug: string | null, signedIn: boolean) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!slug || !signedIn) return;
    void post(slug, "view").then(() => queryClient.invalidateQueries({ queryKey: ["dashboard"] }));
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void post(slug, "heartbeat");
    }, HEARTBEAT_MS);
    return () => window.clearInterval(timer);
  }, [slug, signedIn, queryClient]);
}
