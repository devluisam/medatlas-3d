"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RegisterSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "Deve conter ao menos um número"),
});

type RegisterData = z.infer<typeof RegisterSchema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({ resolver: zodResolver(RegisterSchema) });

  const onSubmit = async (data: RegisterData) => {
    setIsLoading(true);
    // await fetch("/api/auth/register", { method: "POST", body: JSON.stringify(data) })
    setIsLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-white font-bold text-lg mb-2">Conta criada!</h3>
        <p className="text-white/50 text-sm">Verifique seu email para ativar a conta.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-white/70 text-sm">Nome completo</Label>
        <Input
          {...register("name")}
          placeholder="Dr. João Silva"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/25 h-11"
        />
        {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-white/70 text-sm">Email</Label>
        <Input
          type="email"
          {...register("email")}
          placeholder="seu@email.com"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/25 h-11"
        />
        {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-white/70 text-sm">Senha</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="Mínimo 8 caracteres"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/25 h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full h-11 bg-blue-600 hover:bg-blue-500">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar conta gratuita"}
      </Button>

      <p className="text-center text-white/25 text-xs">
        Ao criar uma conta, você concorda com os{" "}
        <a className="text-white/40 underline">Termos de Uso</a> e{" "}
        <a className="text-white/40 underline">Política de Privacidade</a>.
      </p>
    </form>
  );
}
