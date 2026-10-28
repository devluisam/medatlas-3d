import "server-only";
import OpenAI from "openai";
import { config, isAiConfigured } from "@/lib/config";
import { ApiError } from "../http";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!isAiConfigured()) {
    throw new ApiError(
      "AI_UNAVAILABLE",
      "O tutor de IA não está disponível nesta instalação. O atlas, o quiz com questões do banco e os flashcards continuam funcionando."
    );
  }
  client ??= new OpenAI({ apiKey: config.ai.apiKey!, timeout: config.ai.timeoutMs, maxRetries: 1 });
  return client;
}

/** Sinal que cancela quando o cliente desconecta ou quando o tempo limite estoura. */
export function aiSignal(requestSignal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(config.ai.timeoutMs);
  return requestSignal ? AbortSignal.any([requestSignal, timeout]) : timeout;
}

/** Traduz falhas do provedor em mensagens úteis, sem repassar o erro bruto. */
export function toAiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof OpenAI.APIError) {
    if (error.status === 401 || error.status === 403) {
      console.error("[ai] chave da OpenAI recusada pelo provedor");
      return new ApiError("AI_UNAVAILABLE", "O serviço de IA está indisponível no momento (configuração do servidor).");
    }
    if (error.status === 429) {
      return new ApiError("AI_FAILED", "O serviço de IA está sobrecarregado. Tente de novo em alguns minutos.");
    }
    console.error(`[ai] erro do provedor: status ${error.status}`);
    return new ApiError("AI_FAILED", "O serviço de IA não respondeu como esperado. Tente novamente.");
  }
  if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
    return new ApiError("AI_FAILED", "A IA demorou demais para responder. Tente uma pergunta mais curta.");
  }
  console.error("[ai] falha inesperada:", error instanceof Error ? error.name : typeof error);
  return new ApiError("AI_FAILED", "Não foi possível falar com a IA agora. Tente novamente.");
}
