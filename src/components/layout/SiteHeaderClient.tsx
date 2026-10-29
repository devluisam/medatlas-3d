"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="ml-4 hidden items-center gap-1 md:flex">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm transition-colors",
            isActive(pathname, item.href)
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function MobileNav({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
          <Menu />
        </Button>
      </DialogTrigger>
      <DialogContent className="top-0 max-w-none translate-y-0 rounded-none border-x-0 border-t-0 p-4 data-[state=open]:slide-in-from-top-4">
        <DialogTitle className="eyebrow">Navegação</DialogTitle>
        <nav aria-label="Principal" className="grid gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-base",
                isActive(pathname, item.href) ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60"
              )}
            >
              <item.icon className="h-5 w-5" aria-hidden />
              {item.label}
              {item.private && !signedIn && <span className="ml-auto text-xs text-muted-foreground">requer conta</span>}
            </Link>
          ))}
        </nav>
      </DialogContent>
    </Dialog>
  );
}

export function UserMenu({ name, email }: { name: string; email: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2" aria-label={`Conta de ${name}`}>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {initials || <User className="h-4 w-4" />}
          </span>
          <span className="hidden max-w-[10rem] truncate text-sm lg:inline">{name.split(" ")[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Meu painel</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/privacidade">Privacidade e dados</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut({ redirectTo: "/" })}>
          <LogOut aria-hidden />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
