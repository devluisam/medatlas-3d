# MEDATLAS 3D — Arquitetura Técnica

## Visão Geral

MEDATLAS 3D é uma plataforma web de anatomia humana 3D construída com Next.js 15, React 19, Three.js e IA generativa. A arquitetura segue princípios de **Clean Architecture** com **Feature-Based Structure**.

---

## Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router, PPR, Server Actions) |
| UI Framework | React 19 + TypeScript |
| Estilização | Tailwind CSS + Shadcn/UI |
| Animações | Framer Motion |
| 3D Engine | Three.js + React Three Fiber + Drei |
| Pós-processamento | @react-three/postprocessing |
| Estado Global | Zustand + Immer |
| Banco de Dados | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | NextAuth v5 |
| IA | OpenAI GPT-4o (streaming) |
| Deploy | Vercel (Edge Functions) |

---

## Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Rotas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── (viewer)/           # Visualizador 3D principal
│   │   └── viewer/
│   ├── (dashboard)/        # Painel do estudante
│   │   └── dashboard/
│   ├── (study)/            # Módulos de estudo
│   │   ├── quiz/
│   │   └── flashcards/
│   ├── api/                # API Routes
│   │   ├── ai/
│   │   │   ├── chat/       # Chat streaming com GPT-4o
│   │   │   └── quiz/       # Geração de questões IA
│   │   ├── structures/     # CRUD estruturas anatômicas
│   │   ├── search/         # Busca full-text
│   │   └── auth/           # NextAuth handlers
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
│
├── components/             # Componentes React
│   ├── ui/                 # Shadcn primitivos
│   ├── viewer/             # Visualizador 3D
│   │   ├── 3d/             # Cenas e meshes Three.js
│   │   ├── controls/       # Toolbar, HUD, tooltips
│   │   ├── layers/         # Painel de camadas
│   │   └── cutting/        # Controle de corte
│   ├── study/              # Central de estudos
│   │   └── tabs/           # Abas de conteúdo
│   ├── ai/                 # Chat IA
│   ├── quiz/               # Quiz engine
│   ├── dashboard/          # Painel do usuário
│   ├── search/             # Busca global
│   ├── auth/               # Forms de autenticação
│   └── layout/             # Providers, nav
│
├── stores/                 # Estado global Zustand
│   ├── viewer.store.ts     # Estado do visualizador
│   ├── study.store.ts      # Painel de estudo
│   └── quiz.store.ts       # Sessão de quiz
│
├── types/                  # TypeScript types
│   └── index.ts
│
├── lib/                    # Utilitários
│   ├── db.ts               # Prisma client
│   └── utils.ts
│
└── hooks/                  # React hooks
    └── useDebounce.ts

prisma/
├── schema.prisma           # Schema do banco
└── seed.ts                 # Dados iniciais
```

---

## Modelos de Dados Principais

### AnatomicalStructure
Armazena cada estrutura do corpo humano com conteúdo educacional completo:
- Dados básicos (nome, sistema, região)
- 9 abas de conteúdo (anatomia, fisiologia, histologia...)
- Referências para modelo 3D
- Vetores de busca semântica (pgvector)

### Question
Banco de questões com suporte a múltiplos tipos, níveis e gamificação.

### UserProgress
Rastreia progresso por estrutura com SM-2 spaced repetition para flashcards.

---

## Motor 3D

### AnatomyCanvas
Canvas principal com:
- `ACESFilmicToneMapping` para renderização realística
- Post-processing: SSAO + Bloom + Vignette
- Orbit controls com damping
- LOD automático via `AdaptiveDpr`

### HumanBodyModel
- Cada mesh tem `userData.structureId` e `userData.system`
- Raycasting via `onPointerOver`/`onClick` do R3F
- Em produção: substituir capsules por GLTFs reais

### Modelos GLTF (produção)
Recomendados: BodyParts3D (CC-BY), Visible Body, ou modelos customizados.
Formato: GLTF/GLB com LOD (3 níveis) + Draco compression.

---

## API de IA

### `/api/ai/chat` (Edge, streaming)
- SSE streaming com ReadableStream
- Contexto anatômico injetado no system prompt
- 4 níveis de profundidade (Básico → Residência)

### `/api/ai/quiz` (Edge)
- Gera questões JSON via GPT-4o
- `response_format: { type: "json_object" }` para output confiável
- Fallback para banco local se API falhar

---

## Segurança

- **JWT** via NextAuth com rotação automática
- **Row Level Security** no Supabase/PostgreSQL
- **Zod** validation em todos endpoints
- **Rate limiting** via Upstash Redis (Edge middleware)
- Headers de segurança em `next.config.ts`
- **CSRF** protegido pelo NextAuth
- SQL injection impossível via Prisma ORM

---

## Performance

- **PPR** (Partial Prerendering) para páginas mistas
- **AdaptiveDpr** no WebGL (alvo 60fps em qualquer GPU)
- **LOD** com 3 níveis por sistema anatômico
- **Lazy loading** de sistemas não visíveis
- **React Query** com stale-while-revalidate
- **Streaming RSC** para conteúdo da central de estudos

---

## Roadmap de Implementação

### Fase 1 — MVP (semanas 1-4)
- [x] Estrutura do projeto
- [x] Schema do banco de dados
- [x] Landing page
- [x] Visualizador básico com corpo placeholder
- [x] Painel de camadas
- [x] Central de estudos (10 abas)
- [x] Chat IA streaming
- [x] Sistema de quiz
- [x] Dashboard
- [ ] Auth completa (NextAuth)
- [ ] Deploy no Vercel

### Fase 2 — Modelos 3D (semanas 5-8)
- [ ] Integrar GLTFs reais (esquelético)
- [ ] Sistema muscular superficial
- [ ] Sistemas vasculares
- [ ] LOD automático
- [ ] Texturas PBR

### Fase 3 — Conteúdo (semanas 9-16)
- [ ] Seed completo: 200+ estruturas
- [ ] Banco de 1.000+ questões
- [ ] Flashcards automáticos via IA
- [ ] Casos clínicos interativos

### Fase 4 — Avançado (semanas 17-24)
- [ ] Cortes anatômicos via clipping planes
- [ ] Animações fisiológicas (batimento cardíaco, respiração)
- [ ] Modo AR (WebXR)
- [ ] API pública para instituições
- [ ] App mobile (React Native)

---

## Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env.local

# Banco de dados
npm run db:push      # Aplica schema
npm run db:seed      # Popula dados iniciais
npm run db:studio    # Prisma Studio (GUI)

# Desenvolvimento
npm run dev          # Next.js + Turbopack

# Produção
npm run build
npm run start
```
