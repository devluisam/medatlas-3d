"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, History, Plus, Send, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/ui/markdown";
import { EmptyState, LoadingState, Notice } from "@/components/ui/state";
import { apiFetch, ApiClientError, errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { keys, useAiStatus } from "./queries";

const MAX_CHARS = 2000;

interface Message {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  /** resposta ainda chegando */
  streaming?: boolean;
  error?: boolean;
}

interface ConversationSummary {
  id: string;
  title: string | null;
  updatedAt: string;
}

/** Lê o corpo SSE do tutor (eventos meta, delta, done, error). */
async function readEvents(res: Response, on: (event: string, data: Record<string, string>) => void) {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const event = /^event: (.+)$/m.exec(block)?.[1];
      const data = /^data: (.+)$/m.exec(block)?.[1];
      if (event && data) on(event, JSON.parse(data) as Record<string, string>);
    }
  }
}

const SUGGESTIONS = [
  "Resuma os pontos mais cobrados em prova",
  "Quais são as principais relações anatômicas?",
  "Explique uma correlação clínica importante",
];

export function TutorChat({ slug, name, signedIn, loginHref }: { slug: string; name: string; signedIn: boolean; loginHref: string }) {
  const queryClient = useQueryClient();
  const status = useAiStatus();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const history = useQuery({
    queryKey: keys.conversations(slug),
    queryFn: () => apiFetch<{ conversations: ConversationSummary[] }>(`/api/ai/conversations?structure=${slug}`),
    select: (d) => d.conversations,
    enabled: signedIn && !!status.data?.available,
  });

  // Troca de estrutura: começa conversa nova e cancela a resposta em andamento
  useEffect(() => {
    abortRef.current?.abort();
    setMessages([]);
    setConversationId(null);
    setShowHistory(false);
  }, [slug]);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages]);

  if (!signedIn)
    return (
      <EmptyState
        icon={Bot}
        title="Tutor de IA"
        description="O tutor responde dúvidas sobre esta estrutura usando o conteúdo do atlas como referência. Exige conta, para limitar o uso por pessoa."
        action={
          <Button asChild size="sm">
            <Link href={loginHref}>Entrar para usar</Link>
          </Button>
        }
      />
    );
  if (status.isLoading) return <LoadingState />;
  if (!status.data?.available)
    return (
      <EmptyState
        icon={Bot}
        title="Tutor indisponível nesta instalação"
        description="A chave do provedor de IA não está configurada no servidor. Todo o conteúdo, as questões e os flashcards continuam disponíveis."
      />
    );

  const remaining = status.data.chat?.remaining ?? 0;

  const openConversation = async (id: string) => {
    abortRef.current?.abort();
    setShowHistory(false);
    try {
      const c = await apiFetch<{ id: string; messages: Message[] }>(`/api/ai/conversations/${id}`);
      setConversationId(c.id);
      setMessages(c.messages);
    } catch (e) {
      setMessages([{ id: "err", role: "ASSISTANT", content: errorMessage(e), error: true }]);
    }
  };

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || streaming) return;
    const controller = new AbortController();
    abortRef.current = controller;
    const replyId = `a-${Date.now()}`;
    setInput("");
    setStreaming(true);
    setMessages((m) => [
      ...m,
      { id: `u-${Date.now()}`, role: "USER", content: message },
      { id: replyId, role: "ASSISTANT", content: "", streaming: true },
    ]);
    const patch = (fn: (msg: Message) => Message) => setMessages((m) => m.map((x) => (x.id === replyId ? fn(x) : x)));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, structureSlug: slug, ...(conversationId && { conversationId }) }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        throw new ApiClientError(body?.error?.message ?? "O tutor não respondeu. Tente novamente.", res.status, "HTTP");
      }
      await readEvents(res, (event, data) => {
        if (event === "meta") setConversationId(data.conversationId!);
        if (event === "delta") patch((x) => ({ ...x, content: x.content + data.text }));
        if (event === "error") patch((x) => ({ ...x, content: x.content ? `${x.content}\n\n_${data.message}_` : data.message!, error: true }));
      });
    } catch (e) {
      if (controller.signal.aborted) {
        patch((x) => ({ ...x, content: x.content ? `${x.content}\n\n_(resposta interrompida)_` : "_(cancelado)_" }));
      } else {
        patch((x) => ({ ...x, content: errorMessage(e), error: true }));
      }
    } finally {
      patch((x) => ({ ...x, streaming: false }));
      setStreaming(false);
      abortRef.current = null;
      void queryClient.invalidateQueries({ queryKey: keys.aiStatus });
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  };

  return (
    <div className="flex h-full min-h-[24rem] flex-col gap-3">
      <Notice tone="ai" icon={Sparkles}>
        Respostas geradas por IA a partir do conteúdo do atlas. Podem conter erros — confira com seus livros e professores.
      </Notice>

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {remaining} de {status.data.chat?.limit} mensagens restantes nas últimas 24 h
        </span>
        <div className="flex gap-1">
          {(history.data?.length ?? 0) > 0 && (
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" aria-expanded={showHistory} onClick={() => setShowHistory((v) => !v)}>
              <History aria-hidden /> Conversas
            </Button>
          )}
          {messages.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              disabled={streaming}
              onClick={() => {
                setMessages([]);
                setConversationId(null);
              }}
            >
              <Plus aria-hidden /> Nova
            </Button>
          )}
        </div>
      </div>

      {showHistory && (
        <ul className="space-y-1 rounded-lg border border-border/80 bg-card/60 p-1.5" aria-label="Conversas anteriores">
          {history.data?.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={cn(
                  "w-full truncate rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
                  c.id === conversationId && "bg-accent"
                )}
                onClick={() => openConversation(c.id)}
              >
                {c.title ?? "Conversa"}
                <span className="ml-2 text-xs text-muted-foreground">{new Date(c.updatedAt).toLocaleDateString("pt-BR")}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto" aria-live="polite" aria-busy={streaming}>
        {messages.length === 0 ? (
          <div className="space-y-2 py-2">
            <p className="text-sm text-muted-foreground">Pergunte algo sobre {name}:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={remaining === 0}
                onClick={() => send(s)}
                className="block w-full rounded-lg border border-border/80 px-3 py-2 text-left text-sm hover:border-primary/50 hover:bg-accent/40 disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cn("flex", m.role === "USER" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[92%] rounded-xl px-3 py-2 text-sm",
                  m.role === "USER" ? "bg-primary text-primary-foreground" : "bg-muted/60",
                  m.error && "border border-destructive/40 bg-destructive/10"
                )}
              >
                {m.role === "USER" ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : m.content ? (
                  <Markdown>{m.content}</Markdown>
                ) : (
                  <span className="text-muted-foreground">Pensando…</span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <label htmlFor={`tutor-${slug}`} className="sr-only">
          Pergunta ao tutor
        </label>
        <Textarea
          id={`tutor-${slug}`}
          rows={2}
          value={input}
          maxLength={MAX_CHARS}
          disabled={remaining === 0}
          placeholder={remaining === 0 ? "Limite diário atingido" : "Sua pergunta (Enter envia, Shift+Enter quebra linha)"}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
        />
        <div className="flex justify-end">
          {streaming ? (
            <Button type="button" size="sm" variant="outline" onClick={() => abortRef.current?.abort()}>
              <Square aria-hidden /> Parar
            </Button>
          ) : (
            <Button type="submit" size="sm" disabled={!input.trim() || remaining === 0}>
              <Send aria-hidden /> Enviar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
