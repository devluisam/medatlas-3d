import type { PlanType, UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: UserRole;
    plan: PlanType;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      plan: PlanType;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    plan: PlanType;
  }
}

// next-auth/jwt reexporta o tipo de @auth/core/jwt — os callbacks usam o modulo
// de origem, entao a augmentation precisa alcancar os dois.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    plan: PlanType;
  }
}
