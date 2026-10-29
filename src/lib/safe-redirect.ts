/**
 * Destino de retorno seguro após login: só caminhos internos.
 * Bloqueia `https://…`, `//outro-site`, `/\outro-site` e esquemas como `javascript:`.
 */
export function safeCallbackUrl(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  let value: string;
  try {
    value = decodeURIComponent(raw).trim();
  } catch {
    return fallback;
  }
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(value)) return fallback;
  try {
    // Base fictícia: se a URL resolvida mudar de origem, não é interna
    const url = new URL(value, "http://medatlas.local");
    if (url.origin !== "http://medatlas.local") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
