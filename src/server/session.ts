import "server-only";
import { auth } from "@/lib/auth";
import { ApiError } from "./http";

/** ID do usuário logado, ou null. Para rotas públicas com extras para quem tem conta. */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Exige sessão. Toda rota privada começa por aqui; o ID nunca vem do cliente. */
export async function requireUserId(): Promise<string> {
  const id = await getUserId();
  if (!id) throw new ApiError("UNAUTHORIZED", "Entre na sua conta para continuar.");
  return id;
}
