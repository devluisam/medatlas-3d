import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { RegisterSchema } from "@/lib/validations/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { ApiError, json, readJson, route } from "@/server/http";

export const POST = route("auth/register", async (request) => {
  const limit = rateLimit(`register:${clientIp(request.headers)}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    throw new ApiError("RATE_LIMITED", "Muitos cadastros a partir desta rede. Tente mais tarde.", {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  const { name, email, password } = await readJson(request, RegisterSchema, 4_000);
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } });
  if (existing) throw new ApiError("CONFLICT", "Já existe uma conta com esse email. Entre ou use outro email.");

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email: normalizedEmail, password: hashedPassword },
    select: { id: true },
  });

  return json({ ok: true }, { status: 201 });
});
