"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, FileText } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { apiFetch } from "@/lib/api-client";
import { categoryLabel, systemLabel } from "@/lib/labels";
import type { StructureListItem } from "@/server/structures";

function useDebounced<T>(value: T, ms = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/**
 * Busca (Ctrl+K / "/"). Encontra qualquer estrutura do atlas, inclusive as sem
 * malha; o resultado diz qual é qual. A busca ignora acentos no servidor.
 */
export function SearchDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (item: StructureListItem) => void;
}) {
  const [q, setQ] = useState("");
  const term = useDebounced(q.trim());
  const { data, isFetching, isError } = useQuery({
    queryKey: ["search", term],
    queryFn: () => apiFetch<{ results: StructureListItem[] }>(`/api/search?q=${encodeURIComponent(term)}&limit=12`),
    enabled: term.length >= 2,
    select: (d) => d.results,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const results = term.length >= 2 ? (data ?? []) : [];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Buscar estrutura" shouldFilter={false}>
      {/* A filtragem é do servidor (sem acento); o cmdk não deve filtrar de novo */}
      <CommandInput placeholder="Buscar estrutura: fêmur, costela, coração…" value={q} onValueChange={setQ} />
      <CommandList>
        {term.length < 2 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">Digite pelo menos 2 letras.</p>
        ) : isError ? (
          <p className="px-4 py-6 text-center text-sm text-destructive">A busca falhou. Tente novamente.</p>
        ) : (
          <>
            <CommandEmpty>{isFetching ? "Buscando…" : `Nada encontrado para “${term}”.`}</CommandEmpty>
            {results.length > 0 && (
              <CommandGroup heading="Estruturas">
                {results.map((r) => (
                  <CommandItem key={r.slug} value={r.slug} onSelect={() => onPick(r)} className="gap-3">
                    {r.hasModel ? <Box className="text-primary" aria-hidden /> : <FileText className="text-muted-foreground" aria-hidden />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{r.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {categoryLabel(r.category)} · {systemLabel(r.system)}
                        {r.hasModel ? " · no modelo 3D" : " · só conteúdo"}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
