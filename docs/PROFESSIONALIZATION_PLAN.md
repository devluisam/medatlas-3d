# MEDATLAS 3D — Plano de profissionalização

Documento vivo. A auditoria abaixo foi feita lendo o código (fonte de verdade), não a
documentação. Cada item tem evidência (arquivo) e critério de conclusão. O registro de
progresso no fim permite retomar o trabalho se a sessão for interrompida.

## 1. Estado inicial (28/10/2026)

**Stack confirmada** (`npm ls`): Next 15.5.25 (App Router), React 19.2.8, TypeScript 5.7,
Tailwind 3.4.19, Radix UI, Zustand 5 + Immer, three 0.171, @react-three/fiber 9.7,
drei 10.7.8, @react-three/postprocessing 3, Prisma 6.19.3 + PostgreSQL, next-auth
5.0.0-beta.32 + @auth/prisma-adapter, openai 4.104, Zod 3.25.

**Checks de partida**

| Check | Resultado |
|---|---|
| `npx tsc --noEmit` | passa |
| `npm run lint` (`next lint`) | não roda: abre assistente interativo, ESLint nunca configurado; `next lint` está obsoleto |
| `npm run build` | depende de banco: executa `prisma db push` + `prisma db seed` antes do `next build` |
| `npx next build` (só compilação) | passa; landing com 502 kB de JS (three.js para um boneco de cápsulas) |
| Testes | não existem |

## 2. Auditoria

### 2.1 Segurança e integridade de dados (P0)

| # | Problema | Evidência |
|---|---|---|
| S1 | `build` altera o banco (`db push` + seed) a cada deploy — sem migrations, sem rollback, `db push` pode aplicar mudança destrutiva | `package.json` |
| S2 | Rotas de IA públicas, sem autenticação, sem limite de uso: qualquer pessoa consome a chave OpenAI | `api/ai/chat`, `api/ai/quiz` |
| S3 | Chat no Edge Runtime: impede `auth()` + Prisma (sessão, persistência, cota) | `api/ai/chat/route.ts` |
| S4 | Agendamento SM-2 gravado no próprio `Flashcard` (global): um cartão compartilhado teria um único agendamento para todos os usuários | `schema.prisma` (`Flashcard.easeFactor/interval/nextReview`) |
| S5 | Quiz corrigido só no cliente; o gabarito (`isCorrect`, explicações) vai para o navegador inclusive no modo Simulado; nada é persistido | `QuizResults.tsx`, `api/ai/quiz` |
| S6 | Google com `allowDangerousEmailAccountLinking: true` sem verificação de email: quem cadastrar o email de outra pessoa com senha fica com acesso à conta quando a vítima entrar com Google (pre-hijacking) | `lib/auth.ts` |
| S7 | Redirecionamento aberto: `callbackUrl` vai direto para `router.push` | `LoginForm.tsx` |
| S8 | Sem rate limiting em login/registro; login com tempo diferente para email inexistente (enumeração por tempo) | `lib/auth.ts`, `api/auth/register` |
| S9 | Sem headers de segurança | `next.config.ts` |
| S10 | Parâmetros sem validação (`limit` aceita `NaN`/negativo, `system` vira enum sem checagem → erro 500 do Prisma) | `api/search`, `api/structures/[id]/questions` |
| S11 | Seed não idempotente para questões (apaga por enunciado e recria → IDs mudam e quebram tentativas que referenciam a questão) | `prisma/seed.ts` |
| S12 | `drei <Environment preset>` baixa HDR de CDN externo em tempo de execução | `AnatomyCanvas.tsx` |
| S13 | Modelo CC-BY-4.0 (autor "Terrie", Sketchfab) usado **sem atribuição** em nenhum lugar | `public/models/skeleton.glb` (`asset.extras`) |

### 2.2 Funcionalidades simuladas, parciais ou quebradas (P1)

| # | Problema | Evidência |
|---|---|---|
| F1 | Dashboard 100% mock (XP 2.100, "47h 30min", "312 estruturas", "12 dias", conquistas e gráfico fixos) | `DashboardContent.tsx` |
| F2 | Flashcards: 2 cartões fixos sobre fêmur aparecem em **qualquer** estrutura; avaliação não grava nada; "Gerar com IA" sem ação | `StructureFlashcardsTab.tsx` |
| F3 | Banco tem 0 flashcards; o seed não cria nenhum | `prisma/seed.ts` |
| F4 | Quiz usa só IA; sem chave, falha com erro genérico. As 6 questões do banco nunca são usadas pelo quiz | `QuizHub.tsx` |
| F5 | Quiz: slider até 100 questões, mas a API limita a 20 sem avisar; filtro mostra 10 de 14 sistemas; modo "Casos clínicos" sem diferença real na correção | `QuizHub.tsx`, `api/ai/quiz` |
| F6 | `flagQuestion` vazio; navegação por números não clicável | `quiz.store.ts`, `QuizSession.tsx` |
| F7 | Visualizador: camadas, modos Raio-X/Fantasma/Anatômico/Wireframe, gênero, "Resetar câmera" e plano de corte (só desenha um retângulo, não corta) **não fazem nada** no modelo real | `RealisticSkeleton.tsx`, `viewer.store.ts` |
| F8 | Seleção sem destaque visual (todas as malhas compartilham um material) | `RealisticSkeleton.tsx` |
| F9 | Busca seleciona por `id` (cuid) e o 3D por `slug`: a estrutura buscada nunca é destacada no modelo | `SearchOverlay.tsx` |
| F10 | 14 sistemas anunciados; só há malha do esqueleto. Estruturas não ósseas (coração, fígado...) não têm malha, e isso não é dito | `types/index.ts`, `LayerPanel.tsx` |
| F11 | Fallback de falha do modelo é um boneco de cápsulas que finge ser o esqueleto | `HumanBodyModel.tsx` |
| F12 | Sem detecção de WebGL nem progresso real de carregamento (barra animada fixa de 2,5 s) | `LoadingScreen.tsx` |
| F13 | Botões Favoritar e Compartilhar sem ação; HUD "MEDATLAS 3D v1.0"; MiniMap decorativo | `StudyPanel.tsx`, `ViewerHUD.tsx`, `MiniMap.tsx` |
| F14 | Tutor: badge "GPT-4o" fixo, sem histórico, sem cancelamento, prompt pede para "citar artigos" (convite a referência inventada), contexto enviado pelo cliente sem verificação | `AiTutorChat.tsx`, `api/ai/chat` |
| F15 | Landing com afirmações falsas: "Mais de 50.000 estudantes", "14 sistemas", "640+ músculos", "206 ossos", "Gamificação completa" | `app/page.tsx` |
| F16 | Links "Termos de Uso" e "Política de Privacidade" sem destino | `RegisterForm.tsx` |
| F17 | Sem página de conteúdo navegável (só pelo 3D); sem alternativa para quem não tem WebGL | — |

### 2.3 Qualidade de código e visual (P2)

- `any` em handlers 3D, rotas e store; `HumanBodyModel` com 9 blocos de malha copiados.
- Pós-processamento (SSAO 16 amostras + multisampling) incompatível com transparência e corte; landing carrega three.js só para enfeite.
- Páginas internas (quiz, dashboard) sem navegação comum; cada uma tem seu cabeçalho.
- Abas do painel de estudo com rótulos abreviados ("Anat.", "Quest.") e sem contexto.
- Sem `prefers-reduced-motion`; foco visível inconsistente; botões só com ícone sem rótulo.
- Documentação descreve PPR, Server Actions, pgvector, LOD de 3 níveis, Draco e lazy loading de sistemas — nada disso existe.

### 2.4 Cobertura do modelo 3D

`skeleton.glb`: 16,9 MB, 568 mil triângulos, 183 malhas, 1 material, sem compressão.
Nomes anatômicos em inglês com lado (`l_femur`, `r_rib7`, `c1`…`l5`, `l cuboid`). O
classificador existente cobre todas as 183 malhas e mapeia para 27 estruturas do seed.
Sem malha: caixa torácica (conjunto), quadríceps, nervo femoral, coração, pulmões,
fígado, encéfalo, estômago, rim.

## 3. Prioridades e critérios de conclusão

**P0 — Segurança e dados**
1. Build sem tocar no banco; migrations versionadas com baseline do schema atual; seed
   explícito e idempotente (chaves estáveis). *Pronto quando:* `npm run build` roda sem
   banco e `prisma migrate deploy` + `db:seed` duas vezes seguidas não duplicam nada.
2. Autorização no servidor em toda rota privada, com teste de isolamento entre usuários.
3. IA autenticada, rodando em Node, com cota por usuário gravada no banco, limite de
   tamanho, timeout e cancelamento.
4. Quiz corrigido e pontuado no servidor; gabarito só depois da resposta (Prática) ou da
   finalização (Simulado/Cronometrado); envio repetido idempotente.
5. Revisão SM-2 por usuário (`FlashcardReview`).
6. Linking OAuth seguro, `callbackUrl` sanitizado, rate limit de login/registro,
   headers de segurança.

**P1 — Jornadas completas**
7. Visualizador: seleção ↔ busca ↔ painel pelo mesmo `slug`; destaque, isolar, ocultar,
   transparência, restaurar; corte real; câmera com vistas anatômicas e foco; progresso
   de carregamento; falha de modelo ≠ indisponibilidade; sem WebGL → conteúdo em texto;
   sistemas sem malha marcados como indisponíveis; modelo comprimido; atribuição.
8. Dashboard com dados reais e estado inicial honesto; regras únicas de XP/streak/conquistas.
9. Flashcards: fila de revisão, cartões por estrutura, avaliação persistida.
10. Conteúdo: páginas `/atlas` com busca e filtros; favoritos e anotações persistidos.
11. Tutor com histórico por usuário e aviso de conteúdo gerado por IA.

**P2 — Acabamento**
12. Navegação comum, landing honesta, acessibilidade (teclado, foco, rótulos, movimento
    reduzido), responsividade; documentação fiel.

## 4. Decisões técnicas

- **Identidade da estrutura = `slug`** em URL, 3D, busca e API. `id` (cuid) fica interno.
- **XP e streak derivados dos dados de origem** (estruturas vistas, respostas, revisões,
  conquistas) em `lib/gamification.ts`, em vez de contadores incrementais que podem
  divergir. `StudyStats` deixa de ser usado.
- **Cota de IA no banco** (`AiUsage`), não em memória: funciona com várias instâncias
  serverless. Rate limit de login/registro em memória por instância (documentado).
- **Questões e cartões com `origin`** (`CURATED` | `AI_GENERATED`): a interface sempre diz
  o que foi gerado por IA. Itens do seed são "conteúdo do atlas", sem alegar revisão
  profissional.
- **Compressão meshopt** (decoder embutido no three-stdlib, sem CDN), em vez de Draco
  (o decoder padrão do drei vem do gstatic).
- **Sem pós-processamento no visualizador**: SSAO quebra com transparência e corte e
  custa caro em GPU integrada.

## 5. Registro de progresso

- [x] Auditoria e plano (28/10)
- [x] P0.1 Build sem banco, migrations, seed idempotente (commit e41741b)
- [x] P0.2–P0.6 Camada de serviços com autorização, IA autenticada com cota, quiz no servidor, SM-2 por usuário, auth endurecida (f0c35b9)
- [x] P0.6 `callbackUrl` também sanitizado no formulário (`lib/safe-redirect.ts`); headers de segurança e CSP sem domínios externos (`next.config.ts`; `wasm-unsafe-eval` para o decoder meshopt)
- [x] P1.7 Visualizador reescrito: seleção ↔ busca ↔ painel ↔ URL (`?s=slug`) pelo mesmo slug; destaque, isolar, ocultar, raio-X com opacidade, wireframe, corte real (sagital/coronal/transversal), vistas anatômicas, foco na estrutura com a câmera centrada na área livre; progresso real de download; falha do modelo com nova tentativa; sem WebGL → conteúdo em texto; sistemas sem malha marcados; atribuição CC BY no visualizador e no rodapé
- [x] Correções encontradas testando no navegador: 72 malhas do pé não eram reconhecidas (nomes com `_`), vista "anterior" mostrava o perfil (esterno e mandíbula deslocados no GLB — a frente agora vem de costelas×coluna, patela×fêmur, metatarsos×calcâneo), primeiro quadro perdido com `frameloop="demand"`
- [x] P1.8 Painel com dados reais e estado inicial vazio honesto
- [x] P1.9 Flashcards: fila do dia (`/flashcards`), cartões por estrutura, avaliação gravada (atalhos espaço e 1–4)
- [x] P1.10 `/atlas` com busca sem acento e filtros por sistema/modelo; `/atlas/[slug]` renderizado no servidor; favoritos e anotações
- [x] P1.11 Tutor com streaming, cancelamento, histórico por estrutura, cota visível e aviso de IA
- [x] P2.12 Cabeçalho/rodapé comuns, landing sem afirmações falsas e sem three.js (502 kB → 153 kB), página de privacidade e termos, 404
- [x] Testes unitários: mapeamento do GLB (lê os nós do arquivo) e redirecionamento seguro

**Pendente:** testes de integração das rotas (isolamento entre usuários) com Postgres descartável; testes unitários de `sm2`, `gamification` e `quiz/questions`; telas de login/cadastro ainda no visual antigo; documentação (`ARCHITECTURE.md`, README) a alinhar com o código.

