import NextAuth, { CredentialsSignin, type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { LoginSchema } from "@/lib/validations/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * O provider do Google só entra na lista quando as credenciais existem no
 * ambiente — sem isso o botão fica escondido no formulário em vez de quebrar.
 */
export const isGoogleEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

/**
 * Hash de uma senha descartável. Quando o email não existe, a senha digitada é
 * comparada com ele mesmo assim: a resposta leva o mesmo tempo e não revela
 * quais emails têm conta.
 */
const TIMING_DUMMY_HASH = "$2b$12$uEEG1TASGbE27p55NPvcTufDtKrGDA0kJ4QTpj0AwRbU8yXWrPfue";

class TooManyAttempts extends CredentialsSignin {
  code = "rate_limited";
}

const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Senha", type: "password" },
    },
    async authorize(credentials, request) {
      const parsed = LoginSchema.safeParse(credentials);
      if (!parsed.success) return null;
      const email = parsed.data.email.toLowerCase();

      // Por email (freia ataque a uma conta) e por IP (freia varredura de contas)
      const ip = clientIp(request.headers);
      const byEmail = rateLimit(`login:email:${email}`, 8, LOGIN_WINDOW_MS);
      const byIp = rateLimit(`login:ip:${ip}`, 30, LOGIN_WINDOW_MS);
      if (!byEmail.ok || !byIp.ok) throw new TooManyAttempts();

      const user = await prisma.user.findUnique({ where: { email } });

      // Conta criada por OAuth não tem senha — não pode entrar por credenciais.
      const hash = user?.password ?? TIMING_DUMMY_HASH;
      const passwordMatches = await bcrypt.compare(parsed.data.password, hash);
      if (!user?.password || !passwordMatches) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        plan: user.plan,
      };
    },
  }),
];

if (isGoogleEnabled) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Sem vinculação automática por email: como o cadastro com senha não
      // verifica o email, vincular entregaria a conta de quem entra com Google
      // a quem cadastrou aquele email antes. Quem já tem conta com senha recebe
      // "OAuthAccountNotLinked" na tela de login.
      allowDangerousEmailAccountLinking: false,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials exige JWT: o adapter não cria sessão de banco nesse fluxo.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
        token.plan = user.plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.plan = token.plan;
      }
      return session;
    },
  },
});
