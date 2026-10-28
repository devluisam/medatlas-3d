import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().trim().email("Email inválido").max(254),
  password: z.string().min(1, "Informe sua senha").max(72, "Senha longa demais"),
});

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres").max(80, "Nome longo demais"),
  email: z.string().trim().email("Email inválido").max(254),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    // bcrypt ignora o que passa de 72 bytes: melhor recusar do que truncar calado
    .max(72, "Senha deve ter no máximo 72 caracteres")
    .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "Deve conter ao menos um número"),
});

export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterData = z.infer<typeof RegisterSchema>;

/** Destino pós-login: só caminhos internos (evita redirecionamento aberto). */
export function safeCallbackUrl(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
