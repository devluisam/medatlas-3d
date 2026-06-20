import { Metadata } from "next";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard — MEDATLAS 3D",
  description: "Seu painel de progresso na anatomia humana.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
