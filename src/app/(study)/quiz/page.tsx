import { Metadata } from "next";
import { QuizHub } from "@/components/quiz/QuizHub";

export const metadata: Metadata = {
  title: "Quiz Anatômico — MEDATLAS 3D",
  description: "Teste seus conhecimentos com 20.000+ questões de anatomia humana.",
};

export default function QuizPage() {
  return <QuizHub />;
}
