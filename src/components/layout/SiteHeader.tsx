import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { MainNav, MobileNav, UserMenu } from "./SiteHeaderClient";

/** Cabeçalho comum das páginas (exceto o visualizador, que tem barra própria). */
export async function SiteHeader() {
  const session = await auth();
  const user = session?.user ? { name: session.user.name ?? "Estudante", email: session.user.email ?? "" } : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container flex h-14 items-center gap-4">
        <MobileNav signedIn={!!user} />
        <Logo />
        <MainNav />
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <UserMenu name={user.name} email={user.email} />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/register">Criar conta</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
