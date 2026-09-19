import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { isGoogleEnabled } from "@/lib/auth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Entrar — MEDATLAS 3D",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050a14] flex">
      {/* Left — decoration */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(210 100% 52% / 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(210 100% 52% / 0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_40%_50%,hsl(210_100%_52%/0.12),transparent)]" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold font-space text-lg">M</span>
            </div>
            <span className="text-xl font-bold font-space">
              MEDATLAS <span className="text-blue-400">3D</span>
            </span>
          </Link>
          <h1 className="text-5xl font-bold font-space leading-tight mb-6">
            A anatomia humana
            <br />
            <span className="text-blue-400">na palma da mão</span>
          </h1>
          <p className="text-white/50 text-lg max-w-md">
            2.500+ estruturas interativas, IA tutor e 20.000 questões de
            residência médica.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 lg:max-w-[480px] flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">Bem-vindo de volta</h2>
            <p className="text-white/40 text-sm mt-1">
              Entre para continuar seus estudos
            </p>
          </div>
          <Suspense fallback={<div className="h-64" />}>
            <LoginForm googleEnabled={isGoogleEnabled} />
          </Suspense>
          <p className="text-center text-white/40 text-sm mt-6">
            Não tem conta?{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300">
              Criar conta gratuita
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
