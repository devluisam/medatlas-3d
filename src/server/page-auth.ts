import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Página privada: sem sessão, vai para o login e volta para `returnTo` depois. */
export async function requirePageUser(returnTo: string) {
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(returnTo)}`);
  return { id: session.user.id, name: session.user.name ?? "Estudante" };
}
