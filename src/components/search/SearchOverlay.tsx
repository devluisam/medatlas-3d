"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ChevronRight } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useStudyStore } from "@/stores/study.store";
import { useViewerStore } from "@/stores/viewer.store";
import { useDebounce } from "@/hooks/useDebounce";
import type { SearchResult } from "@/types";

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { openPanel } = useStudyStore();
  const { selectStructure } = useViewerStore();

  const debouncedQuery = useDebounce(query, 300);

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger search on debounced query
  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    selectStructure(result.id);
    openPanel(result.id);
  };

  // Open via Ctrl+K / Cmd+K, or via the toolbar button (custom event)
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const openHandler = () => setOpen(true);
    window.addEventListener("keydown", keyHandler);
    window.addEventListener("medatlas:open-search", openHandler);
    return () => {
      window.removeEventListener("keydown", keyHandler);
      window.removeEventListener("medatlas:open-search", openHandler);
    };
  }, []);

  const CATEGORY_COLORS: Record<string, string> = {
    BONE: "text-gray-300 border-gray-500/30",
    MUSCLE: "text-red-400 border-red-500/30",
    NERVE: "text-yellow-400 border-yellow-500/30",
    ARTERY: "text-red-500 border-red-600/30",
    VEIN: "text-blue-400 border-blue-500/30",
    ORGAN: "text-orange-400 border-orange-500/30",
    GLAND: "text-purple-400 border-purple-500/30",
  };

  return (
    <>
      {/* Dialog (opened via toolbar search button or Ctrl/Cmd+K) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl p-0 bg-[#0a1628] border-white/10 overflow-hidden">
          <Command shouldFilter={false} className="bg-transparent">
            <div className="flex items-center border-b border-white/10 px-3">
              <Search className="w-4 h-4 text-white/30 mr-2 shrink-0" />
              <CommandInput
                value={query}
                onValueChange={(v) => {
                  setQuery(v);
                  search(v);
                }}
                placeholder="Buscar osso, músculo, nervo, órgão..."
                className="bg-transparent border-none text-white placeholder:text-white/25 py-3.5 text-sm focus:ring-0"
              />
              {isLoading && <Loader2 className="w-4 h-4 text-white/30 animate-spin ml-2 shrink-0" />}
              {query && (
                <button
                  onClick={() => { setQuery(""); setResults([]); }}
                  className="text-white/30 hover:text-white/60 ml-2 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <CommandList className="max-h-80 py-2">
              <CommandEmpty className="py-8 text-center text-white/30 text-sm">
                {query.length < 2
                  ? "Digite para buscar estruturas anatômicas..."
                  : "Nenhuma estrutura encontrada."}
              </CommandEmpty>

              {results.length > 0 && (
                <CommandGroup heading="Estruturas" className="text-white/30 text-xs px-3">
                  {results.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.id}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white/5 rounded-lg mx-2 text-white/80 aria-selected:bg-white/8"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.name}</p>
                        {result.scientificName && (
                          <p className="text-white/35 text-xs italic truncate">
                            {result.scientificName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${
                            CATEGORY_COLORS[result.category] ?? "text-white/40 border-white/10"
                          }`}
                        >
                          {result.category}
                        </Badge>
                        <ChevronRight className="w-3 h-3 text-white/20" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>

            <div className="border-t border-white/8 px-3 py-2 flex items-center gap-3 text-[11px] text-white/25">
              <span><kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">↑↓</kbd> Navegar</span>
              <span><kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">Enter</kbd> Selecionar</span>
              <span><kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">Esc</kbd> Fechar</span>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
