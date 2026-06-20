"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Brain, Sparkles, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AiContext, AiMessage } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AiTutorChatProps {
  context?: AiContext;
}

const STUDY_LEVELS = [
  { value: "BASIC", label: "Básico" },
  { value: "INTERMEDIATE", label: "Intermediário" },
  { value: "ADVANCED", label: "Avançado" },
  { value: "RESIDENCY", label: "Residência" },
];

const QUICK_PROMPTS = [
  "Explique a fisiologia",
  "Quais as patologias?",
  "Gere 3 questões",
  "Faça um resumo",
  "Correlação clínica",
];

export function AiTutorChat({ context }: AiTutorChatProps) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [level, setLevel] = useState("INTERMEDIATE");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: AiMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsStreaming(true);

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", createdAt: new Date() },
      ]);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            context: { ...context, studyLevel: level },
          }),
        });

        if (!res.ok) throw new Error("AI request failed");

        const reader = res.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content ?? "";
                accumulated += delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: accumulated } : m
                  )
                );
              } catch {}
            }
          }
        }
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "Desculpe, ocorreu um erro. Tente novamente.",
                }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [context, isStreaming, level]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[400px] -mx-5 -mt-5">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-600/20 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-white/80 text-sm font-medium">IA Tutor Médico</span>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 border-purple-500/30 text-purple-400"
          >
            GPT-4o
          </Badge>
        </div>

        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="h-7 w-32 text-xs border-white/10 bg-white/3 text-white/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0d1b2e] border-white/10 text-white">
            {STUDY_LEVELS.map((l) => (
              <SelectItem
                key={l.value}
                value={l.value}
                className="text-xs hover:bg-white/10 cursor-pointer"
              >
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Sparkles className="w-8 h-8 text-purple-400/40 mb-3" />
            <p className="text-white/40 text-sm">
              Pergunte sobre {context?.structureName ?? "anatomia"}
            </p>
            <p className="text-white/25 text-xs mt-1">
              O tutor responde no nível selecionado
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-blue-600"
                    : "bg-purple-600/30 border border-purple-500/30"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white text-sm"
                    : "bg-white/5 border border-white/8 text-white/80 text-sm"
                }`}
              >
                {msg.role === "assistant" && msg.content === "" && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                )}
                {msg.role === "assistant" && msg.content !== "" ? (
                  <div className="prose prose-xs prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : msg.role === "user" ? (
                  msg.content
                ) : null}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length === 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-white/45 hover:text-white/70 hover:border-white/25 hover:bg-white/5 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/8 p-3 flex gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre anatomia, fisiologia..."
          rows={2}
          className="resize-none text-sm bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-purple-500/30 rounded-xl"
        />
        <Button
          size="icon"
          disabled={!input.trim() || isStreaming}
          onClick={() => sendMessage(input)}
          className="bg-purple-600 hover:bg-purple-500 text-white shrink-0 h-auto"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
