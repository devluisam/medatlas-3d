/**
 * Limite por janela deslizante, em memória.
 *
 * Vale por instância do servidor: numa implantação serverless com várias
 * instâncias o limite efetivo é maior. Serve para login e cadastro (freia
 * força bruta em uma instância); a cota da IA, que custa dinheiro, fica no
 * banco (src/server/ai/quota.ts) e vale entre instâncias.
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.hits[0] + windowMs - now) / 1000));
    buckets.set(key, bucket);
    return { ok: false, remaining: 0, retryAfterSeconds };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  // Evita crescimento sem limite: descarta as chaves mais antigas
  if (buckets.size > MAX_KEYS) {
    const excess = buckets.size - MAX_KEYS;
    let i = 0;
    for (const k of buckets.keys()) {
      if (i++ >= excess) break;
      buckets.delete(k);
    }
  }

  return { ok: true, remaining: limit - bucket.hits.length, retryAfterSeconds: 0 };
}

export function resetRateLimits() {
  buckets.clear();
}

/** IP do cliente atrás de proxy (Vercel define x-forwarded-for). */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
