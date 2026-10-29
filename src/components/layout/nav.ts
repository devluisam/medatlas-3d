import { Bone, BookOpen, Brain, Layers, LayoutDashboard, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Exige conta (o link leva ao login com retorno) */
  private?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/viewer", label: "Atlas 3D", icon: Bone },
  { href: "/atlas", label: "Conteúdo", icon: BookOpen },
  { href: "/quiz", label: "Quiz", icon: Brain, private: true },
  { href: "/flashcards", label: "Flashcards", icon: Layers, private: true },
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard, private: true },
];
