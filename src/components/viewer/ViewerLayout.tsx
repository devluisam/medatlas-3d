"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertTriangle, BookOpen, Keyboard, ListTree, MonitorX, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Logo } from "@/components/layout/Logo";
import { StudyPanel } from "@/components/study/StudyPanel";
import { MODEL_CREDIT, MODEL_PATH } from "@/lib/anatomy/model-credit";
import { cn } from "@/lib/utils";
import { useViewerStore } from "@/stores/viewer.store";
import type { StructureListItem } from "@/server/structures";
import { StructureNavigator } from "./StructureNavigator";
import { ViewerToolbar } from "./ViewerToolbar";
import { SearchDialog } from "./SearchDialog";
import { hasWebGL } from "./webgl";

// three.js só no cliente e só nesta página
const ViewerCanvas = dynamic(() => import("./ViewerCanvas"), { ssr: false });

function HoverLabel() {
  const hover = useViewerStore((s) => s.hover);
  if (!hover) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-30 rounded-md border border-border/80 bg-popover/95 px-2 py-1 text-xs shadow-lg"
      style={{ left: hover.x + 14, top: hover.y + 14 }}
    >
      {hover.label}
      {hover.slug === "__sem-ficha" && <span className="block text-muted-foreground">sem ficha no atlas</span>}
    </div>
  );
}

function ShortcutsHelp() {
  const rows = [
    ["Arrastar", "girar"],
    ["Rolagem / pinça", "aproximar"],
    ["Botão direito / dois dedos", "mover"],
    ["Clique", "selecionar estrutura"],
    ["← → ↑ ↓", "girar 15°"],
    ["+ / −", "aproximar / afastar"],
    ["Ctrl+K ou /", "buscar"],
    ["Esc", "fechar painel / limpar seleção"],
  ];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Atalhos e controles">
          <Keyboard aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Controles</DialogTitle>
          <DialogDescription>Mouse, toque e teclado.</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-mono text-xs text-muted-foreground">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}

function NoWebGL() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-md space-y-3 text-center">
        <MonitorX className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
        <h1 className="text-xl font-semibold">Este navegador não exibe 3D</h1>
        <p className="text-sm text-muted-foreground">
          O WebGL está desligado ou indisponível (aceleração de hardware desativada, driver bloqueado ou navegador antigo). Todo o
          conteúdo do atlas continua acessível em texto.
        </p>
        <Button asChild>
          <Link href="/atlas">Abrir o conteúdo em texto</Link>
        </Button>
      </div>
    </div>
  );
}

function ModelError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div role="alert" className="hud-panel max-w-sm space-y-3 p-5 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-warning" aria-hidden />
        <p className="font-medium">Não foi possível carregar o modelo 3D</p>
        <p className="text-sm text-muted-foreground">
          Pode ser a conexão ou falta de memória de vídeo. A busca e o painel de estudo continuam funcionando.
        </p>
        <div className="flex justify-center gap-2">
          <Button size="sm" onClick={onRetry}>
            Tentar de novo
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/atlas">Conteúdo em texto</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ViewerLayout({ structures }: { structures: StructureListItem[] }) {
  const params = useSearchParams();
  const { status } = useSession();
  const [webgl, setWebgl] = useState<"checking" | "ok" | "none">("checking");
  const [attempt, setAttempt] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const selected = useViewerStore((s) => s.selectedSlug);
  const panelOpen = useViewerStore((s) => s.panelOpen);
  const modelStatus = useViewerStore((s) => s.modelStatus);
  const select = useViewerStore((s) => s.select);

  useEffect(() => setWebgl(hasWebGL() ? "ok" : "none"), []);

  // Seleção inicial pela URL (?s=femur) — link compartilhável
  const initial = params.get("s");
  useEffect(() => {
    if (initial && /^[a-z0-9-]+$/.test(initial)) select(initial, { focus: true });
    return () => useViewerStore.getState().select(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só na montagem
  }, []);

  // Reflete a seleção na URL sem empilhar histórico nem refazer a página no servidor.
  // Pula a primeira execução: ela ainda vê a seleção vazia, antes de ler ?s=.
  const urlSynced = useRef(false);
  useEffect(() => {
    if (!urlSynced.current) {
      urlSynced.current = true;
      return;
    }
    const url = selected ? `/viewer?s=${selected}` : "/viewer";
    if (`${window.location.pathname}${window.location.search}` !== url) window.history.replaceState(null, "", url);
  }, [selected]);

  // Enquadra a seleção vinda da URL quando o modelo termina de carregar
  useEffect(() => {
    const { selectedSlug, camera } = useViewerStore.getState();
    if (modelStatus === "ready" && selectedSlug) camera({ kind: "focus", slug: selectedSlug });
  }, [modelStatus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || t.isContentEditable);
      if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "Escape" && !typing && !document.querySelector("[role=dialog]")) {
        const s = useViewerStore.getState();
        if (s.selectedSlug) s.select(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const retry = useCallback(async () => {
    const { useGLTF } = await import("@react-three/drei");
    useGLTF.clear(MODEL_PATH);
    useViewerStore.getState().setModelStatus("loading");
    setAttempt((a) => a + 1);
  }, []);

  const pick = (item: StructureListItem) => {
    setSearchOpen(false);
    select(item.slug, { focus: item.hasModel && modelStatus === "ready", tab: "summary" });
  };

  return (
    <div className="viewer-canvas fixed inset-0 flex flex-col overflow-hidden">
      <header className="relative z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/70 px-3 backdrop-blur-md">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden"
          aria-label={navOpen ? "Fechar lista de estruturas" : "Abrir lista de estruturas"}
          aria-expanded={navOpen}
          aria-controls="viewer-nav"
          onClick={() => setNavOpen((v) => !v)}
        >
          {navOpen ? <X aria-hidden /> : <ListTree aria-hidden />}
        </Button>
        <Logo compact />
        <h1 className="sr-only">Atlas 3D do esqueleto</h1>
        <Button
          variant="outline"
          size="sm"
          className="ml-1 h-9 min-w-0 flex-1 justify-start gap-2 text-muted-foreground sm:ml-6 sm:max-w-xs"
          onClick={() => setSearchOpen(true)}
        >
          <Search aria-hidden />
          <span className="truncate">Buscar estrutura</span>
          <kbd className="ml-auto hidden rounded border border-border px-1.5 font-mono text-[10px] sm:inline">Ctrl K</kbd>
        </Button>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <span className="hidden sm:inline-flex">
            <ShortcutsHelp />
          </span>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/atlas">
              <BookOpen aria-hidden /> Conteúdo
            </Link>
          </Button>
          {status === "authenticated" ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Painel</Link>
            </Button>
          ) : status === "unauthenticated" ? (
            <Button asChild size="sm">
              <Link href={`/login?callbackUrl=${encodeURIComponent(selected ? `/viewer?s=${selected}` : "/viewer")}`}>Entrar</Link>
            </Button>
          ) : null}
        </div>
      </header>

      <main id="conteudo" className="relative min-h-0 flex-1">
        {webgl === "none" ? (
          <NoWebGL />
        ) : (
          <>
            <div className="absolute inset-0">{webgl === "ok" && <ViewerCanvas attempt={attempt} />}</div>
            {modelStatus === "error" && <ModelError onRetry={retry} />}
          </>
        )}

        {/* Camada de interface sobre o canvas: só os painéis recebem clique */}
        <div className="pointer-events-none absolute inset-0 flex gap-3 p-3">
          <div
            id="viewer-nav"
            className={cn(
              "hud-panel pointer-events-auto z-10 w-64 shrink-0 flex-col overflow-hidden",
              navOpen ? "absolute inset-y-3 left-3 flex" : "hidden lg:flex"
            )}
          >
            <StructureNavigator structures={structures} onNavigate={() => setNavOpen(false)} />
          </div>

          <div className="relative min-w-0 flex-1" />

          {panelOpen && (
            <div
              className={cn(
                "z-10 flex min-h-0",
                // celular: folha inferior; desktop: coluna à direita
                "absolute inset-x-2 bottom-2 h-[62%] md:static md:inset-auto md:h-auto"
              )}
            >
              <StudyPanel />
            </div>
          )}
        </div>

        {webgl === "ok" && (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center px-3 lg:left-[17rem]",
              panelOpen && "max-md:hidden md:right-[27.5rem]"
            )}
          >
            <ViewerToolbar />
          </div>
        )}

        <p className="pointer-events-auto absolute bottom-1 left-3 z-0 hidden text-[10px] text-muted-foreground/70 lg:block">
          Modelo:{" "}
          <a href={MODEL_CREDIT.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            {MODEL_CREDIT.title}
          </a>{" "}
          · {MODEL_CREDIT.author} ·{" "}
          <a href={MODEL_CREDIT.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            {MODEL_CREDIT.license}
          </a>
        </p>
      </main>

      <HoverLabel />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} onPick={pick} />
    </div>
  );
}
