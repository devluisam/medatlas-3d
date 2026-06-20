import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Criar Conta — MEDATLAS 3D" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#050a14] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold font-space">M</span>
          </div>
          <span className="text-white font-bold font-space">
            MEDATLAS <span className="text-blue-400">3D</span>
          </span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Criar conta gratuita</h1>
          <p className="text-white/40 text-sm mt-1">
            Comece a explorar o corpo humano em 3D
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-white/40 text-sm mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
