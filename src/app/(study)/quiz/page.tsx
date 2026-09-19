import { Metadata } from "next";
import { QuizHub } from "@/components/quiz/QuizHub";

export const metadata: Metadata = {
  title: "Quiz Anatômico — MEDATLAS 3D",
  description: "Pratique anatomia humana com questões comentadas, por sistema e por dificuldade.",
};

export default function QuizPage() {
  return <QuizHub />;
}
