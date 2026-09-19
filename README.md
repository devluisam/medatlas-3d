# MEDATLAS 3D

Plataforma web de estudo de anatomia humana: um modelo 3D navegável no navegador,
ligado a um banco de estruturas anatômicas, quiz gerado por IA e flashcards com
repetição espaçada.

## Sobre o projeto

Estudar anatomia por livro tem um limite: o conteúdo é espacial, mas o material é
plano. Atlas impressos mostram cortes fixos, e a maior parte das ferramentas 3D
disponíveis é paga, pesada ou não conecta o modelo ao estudo em si — você gira um
osso, mas o que você precisa memorizar continua em outro lugar.

O MEDATLAS 3D junta as duas coisas na mesma tela: o estudante navega pelo modelo,
seleciona uma estrutura e recebe ali mesmo a descrição clínica, as questões e os
flashcards daquela estrutura — com o progresso registrado para orientar a próxima
sessão de estudo.

## Funcionalidades

- **Visualizador 3D** — modelo do esqueleto em Three.js / React Three Fiber, com
  controle de câmera, seleção de estruturas, painel de camadas e plano de corte.
- **Pós-processamento** — SSAO, Bloom e Vignette para dar profundidade e legibilidade
  ao modelo.
- **Busca de estruturas** — overlay de busca (`cmdk`) com filtro por sistema anatômico.
- **Conteúdo clínico** — cada estrutura tem descrição, relações anatômicas e patologias
  associadas, servidas por rotas de API próprias.
- **Quiz** — sessão de questões com correção e tela de resultado; questões podem vir do
  banco ou ser geradas pela API da OpenAI.
- **Flashcards com SM-2** — algoritmo de repetição espaçada para agendar as revisões.
- **Tutor de IA** — chat em streaming (Edge Runtime) que responde ajustando a
  profundidade da explicação ao nível de estudo escolhido.
- **Dashboard** — progresso, estatísticas de estudo, streak e conquistas.

## Arquitetura

```
Navegador
   │  React 19 + Next.js 15 (App Router)
   │  Zustand (estado do viewer, quiz e estudo)
   ↓
Three.js / React Three Fiber ──→ modelo .glb + pós-processamento
   │
   ↓
Rotas de API (Next.js)
   ├── /api/structures/[id]            estrutura, relações e patologias
   ├── /api/search                     busca de estruturas
   ├── /api/ai/chat    (Edge)  ──────→ OpenAI (streaming)
   └── /api/ai/quiz            ──────→ OpenAI (geração de questões)
   │
   ↓
Prisma ORM
   ↓
PostgreSQL
```

O estado da interface 3D fica isolado em stores Zustand (`viewer`, `quiz`, `study`),
o que mantém os componentes de cena livres de lógica de aplicação. O conteúdo
anatômico vive no banco e é populado por seed, não fica embutido no código.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) · React 19 · TypeScript |
| 3D | Three.js · React Three Fiber · Drei · @react-three/postprocessing |
| Estado | Zustand + Immer |
| UI | Tailwind CSS · Radix UI · Framer Motion · Recharts · cmdk |
| Dados | Prisma ORM · PostgreSQL |
| IA | OpenAI API (chat em streaming e geração de questões) |
| Validação | Zod · React Hook Form |

## Instalação

Requisitos: Node.js 20+ e um banco PostgreSQL.

```bash
git clone https://github.com/devluisam/medatlas-3d.git
cd medatlas-3d
npm install

cp .env.example .env     # preencha as variáveis
npm run db:generate      # gera o Prisma Client
npm run db:push          # cria as tabelas
npm run db:seed          # popula estruturas, questões e conteúdo clínico

npm run dev              # http://localhost:3000
```

## Variáveis de ambiente

| Variável | Para quê |
|---|---|
| `DATABASE_URL` | Conexão PostgreSQL usada pelo Prisma |
| `DIRECT_URL` | Conexão direta (migrations, quando há pooler) |
| `OPENAI_API_KEY` | Tutor de IA e geração de questões |
| `AUTH_SECRET` | Assinatura da sessão do NextAuth (`npx auth secret`) |
| `AUTH_URL` | URL pública da aplicação |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Opcionais — habilitam o login com Google |

O arquivo `.env` está no `.gitignore` — use o `.env.example` como modelo e nunca
versione chaves.

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/          login e registro
│   ├── (dashboard)/     painel do estudante
│   ├── (study)/quiz/    sessão de quiz
│   ├── (viewer)/viewer/ visualizador 3D
│   └── api/             auth, estruturas, busca e IA
├── components/
│   ├── viewer/          cena 3D, controles, camadas e corte
│   ├── study/           painel de estudo, flashcards e questões
│   ├── quiz/            hub, sessão e resultados
│   ├── ai/              chat do tutor
│   └── ui/              primitivos de interface
├── stores/              Zustand (viewer, quiz, study)
└── lib/                 Prisma, NextAuth (auth.ts) e validações
prisma/
├── schema.prisma        20 modelos (estruturas, quiz, progresso, IA)
├── clinical-content.ts  conteúdo clínico das estruturas
└── seed.ts              carga inicial do banco
```

## Estado atual

O projeto é um MVP funcional: o visualizador, a busca, o conteúdo clínico, o quiz,
os flashcards e o tutor de IA estão implementados, e a aplicação compila e roda.

A autenticação está ligada: NextAuth v5 com provider de credenciais (senha com
bcrypt), sessão em JWT e adapter do Prisma. `/dashboard` exige sessão e redireciona
para `/login` quando não há. O login com Google é opcional — o botão só aparece
quando `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET` estão definidos no ambiente.

Pendente, e explicitamente não pronto:

- Verificação de email e recuperação de senha — não há serviço de email configurado.
- O dashboard identifica o usuário pela sessão, mas as métricas de progresso ainda
  são dados de exemplo, não vêm do banco.
- O modelo 3D usado é o esqueleto; outros sistemas anatômicos ainda não têm malha própria.

## Autor

**Luis Henrique Azevedo** — Manaus, AM
[Portfólio](https://devluisam.github.io) · [GitHub](https://github.com/devluisam) · [LinkedIn](https://www.linkedin.com/in/luis-henrique-94a6183b3)
