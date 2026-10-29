"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState, LoadingState } from "@/components/ui/state";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { keys } from "./queries";

const MAX = 10_000;

interface Library {
  favorite: boolean;
  note: { content: string; updatedAt: string } | null;
}

function useLibrary(slug: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.library(slug),
    queryFn: () => apiFetch<Library>(`/api/structures/${slug}/library`),
    enabled,
  });
}

function useSaveLibrary(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: { favorite?: boolean; note?: string }) =>
      apiFetch<Library>(`/api/structures/${slug}/library`, { method: "PATCH", json: patch }),
    onSuccess: (data) => queryClient.setQueryData(keys.library(slug), data),
    onError: (e) => toast.error(errorMessage(e)),
  });
}

/** Botão de favoritar (só para quem tem conta). */
export function FavoriteButton({ slug, name, signedIn }: { slug: string; name: string; signedIn: boolean }) {
  const { data } = useLibrary(slug, signedIn);
  const save = useSaveLibrary(slug);
  if (!signedIn) return null;
  const favorite = data?.favorite ?? false;
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      aria-pressed={favorite}
      aria-label={favorite ? `Remover ${name} dos favoritos` : `Favoritar ${name}`}
      disabled={!data || save.isPending}
      onClick={() => save.mutate({ favorite: !favorite })}
    >
      <Star className={cn(favorite && "fill-warning text-warning")} aria-hidden />
    </Button>
  );
}

/** Anotação pessoal da estrutura. Salva ao clicar ou com Ctrl+Enter. */
export function StructureNotes({ slug, name }: { slug: string; name: string }) {
  const { data, isLoading, isError, error, refetch } = useLibrary(slug, true);
  const save = useSaveLibrary(slug);
  const [text, setText] = useState("");

  useEffect(() => {
    if (data) setText(data.note?.content ?? "");
  }, [data]);

  if (isLoading) return <LoadingState label="Carregando anotação…" />;
  if (isError)
    return (
      <ErrorState
        description={errorMessage(error)}
        action={
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        }
      />
    );

  const saved = data?.note?.content ?? "";
  const dirty = text.trim() !== saved;

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate({ note: text }, { onSuccess: () => toast.success(text.trim() ? "Anotação salva" : "Anotação apagada") });
      }}
    >
      <label htmlFor={`note-${slug}`} className="text-sm font-medium">
        Suas anotações sobre {name}
      </label>
      <Textarea
        id={`note-${slug}`}
        value={text}
        maxLength={MAX}
        rows={9}
        placeholder="Resumo com suas palavras, mnemônicos, dúvidas para levar à aula…"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && dirty) e.currentTarget.form?.requestSubmit();
        }}
      />
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          {data?.note ? `Salva em ${new Date(data.note.updatedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}` : "Ainda não salva"}
          {" · "}
          {text.length.toLocaleString("pt-BR")}/{MAX.toLocaleString("pt-BR")}
        </span>
        <Button type="submit" size="sm" disabled={!dirty || save.isPending}>
          {save.isPending ? "Salvando…" : "Salvar"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Visível só para você.</p>
    </form>
  );
}
