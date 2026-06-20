import { Metadata } from "next";
import { ViewerLayout } from "@/components/viewer/ViewerLayout";

export const metadata: Metadata = {
  title: "Visualizador 3D — MEDATLAS",
  description: "Explore o corpo humano em 3D interativo com 2.500+ estruturas anatômicas.",
};

export default function ViewerPage() {
  return <ViewerLayout />;
}
