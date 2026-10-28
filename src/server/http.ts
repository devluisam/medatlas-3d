import "server-only";
import { NextResponse } from "next/server";
import { z, ZodError, type ZodType } from "zod";
import { Prisma } from "@prisma/client";

/**
 * Contrato de erro de todas as rotas: `{ error: { code, message } }`.
 * `message` é sempre em português e segura para mostrar ao estudante;
 * detalhes internos ficam só no log do servidor.
 */
export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "AI_UNAVAILABLE"
  | "AI_FAILED"
  | "INTERNAL";

const STATUS: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  AI_UNAVAILABLE: 503,
  AI_FAILED: 502,
  INTERNAL: 500,
};

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public headers?: Record<string, string>
  ) {
    super(message);
  }
}

export const notFound = (what = "Recurso") => new ApiError("NOT_FOUND", `${what} não encontrado.`);
export const badRequest = (message = "Dados inválidos.") => new ApiError("BAD_REQUEST", message);

export function errorResponse(error: ApiError) {
  return NextResponse.json(
    { error: { code: error.code, message: error.message } },
    { status: STATUS[error.code], headers: error.headers }
  );
}

function zodMessage(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Dados inválidos.";
  const path = issue.path.join(".");
  return path ? `Campo inválido (${path}): ${issue.message}` : issue.message;
}

/** Converte qualquer exceção numa resposta do contrato, sem vazar detalhes. */
export function toErrorResponse(error: unknown, route: string) {
  if (error instanceof ApiError) return errorResponse(error);
  if (error instanceof ZodError) return errorResponse(badRequest(zodMessage(error)));
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return errorResponse(notFound());
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    // Duas requisições iguais ao mesmo tempo (ex.: duplo clique): a segunda perde
    return errorResponse(new ApiError("CONFLICT", "Esta ação já foi registrada. Atualize a página."));
  }
  // Só o tipo e a mensagem — nunca o corpo da requisição (pode ter senha ou texto do estudante)
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error(`[api] ${route} falhou — ${detail}`);
  return errorResponse(new ApiError("INTERNAL", "Erro interno. Tente novamente em instantes."));
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Envolve um handler de rota com o tratamento de erro padrão. */
export function route<C = unknown>(name: string, handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      return toErrorResponse(error, name);
    }
  };
}

/** Lê e valida o corpo JSON. Corpo ausente, malformado ou grande demais vira 400. */
export async function readJson<T extends ZodType>(req: Request, schema: T, maxBytes = 16_000): Promise<z.infer<T>> {
  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > maxBytes) throw badRequest("Requisição grande demais.");
  let text: string;
  try {
    text = await req.text();
  } catch {
    throw badRequest("Corpo da requisição inválido.");
  }
  if (text.length > maxBytes) throw badRequest("Requisição grande demais.");
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw badRequest("Corpo da requisição não é JSON válido.");
  }
  return schema.parse(body);
}

/** Valida a query string com um schema Zod (valores chegam como string). */
export function readQuery<T extends ZodType>(req: Request, schema: T): z.infer<T> {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  return schema.parse(params);
}

export async function readParams<T extends ZodType>(params: Promise<unknown>, schema: T): Promise<z.infer<T>> {
  return schema.parse(await params);
}

/** Slug de estrutura: minúsculas, números e hífen. */
export const SlugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9-]+$/, "slug inválido");

/** IDs gerados pelo Prisma (cuid) */
export const IdSchema = z
  .string()
  .min(10)
  .max(40)
  .regex(/^[a-z0-9]+$/i, "id inválido");

export const json = <T>(data: T, init?: ResponseInit) => NextResponse.json(data, init);
