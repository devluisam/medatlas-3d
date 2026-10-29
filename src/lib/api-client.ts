/**
 * Cliente das rotas /api no navegador. Toda falha vira ApiClientError com a
 * mensagem em português que o servidor enviou (contrato `{ error: { code, message } }`).
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message);
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers: { ...(json !== undefined && { "Content-Type": "application/json" }), ...rest.headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiClientError("Sem conexão com o servidor. Verifique sua internet.", 0, "NETWORK");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
    throw new ApiClientError(
      body?.error?.message ?? "Algo deu errado. Tente novamente.",
      res.status,
      body?.error?.code ?? "UNKNOWN"
    );
  }
  return (await res.json()) as T;
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Algo deu errado. Tente novamente.";
