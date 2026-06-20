import { PrismaClient, Prisma } from "@prisma/client";
import { CLINICAL_CONTENT } from "./clinical-content";

const prisma = new PrismaClient();

const STRUCTURES = [
  // ============================================================
  // SISTEMA ESQUELÉTICO (clicáveis no modelo 3D)
  // ============================================================
  {
    slug: "skull",
    name: "Crânio",
    scientificName: "Cranium",
    commonNames: ["crânio", "caixinha craniana", "caveira"],
    category: "BONE" as const,
    system: "SKELETAL" as const,
    region: "HEAD" as const,
    side: "MIDLINE" as const,
    modelId: "skull",
    difficulty: "BASIC" as const,
    summary:
      "O crânio é a estrutura óssea que protege o encéfalo e abriga os órgãos dos sentidos da cabeça. É formado por 22 ossos na maioria dos adultos, divididos em **neurocrânio** (8 ossos) e **viscerocrânio** (14 ossos).",
    anatomyDetail: `## Neurocrânio (caixa craniana)
**Ossos da abóbada e base:**
- Frontal (1)
- Parietal (2)
- Occipital (1)
- Temporal (2)
- Esfenoide (1)
- Etmoide (1)

## Suturas (articulações fibrosas)
- **Sutura coronal**: frontal + parietais
- **Sutura sagital**: entre os dois parietais
- **Sutura lambdóide**: parietais + occipital

## Forames importantes
- Forame magno (occipital) — passagem do bulbo
- Forame oval — nervo mandibular (V3)
- Forame redondo — nervo maxilar (V2)`,
    physiology: `O crânio cumpre três funções fisiológicas fundamentais:

1. **Proteção mecânica**: Protege o encéfalo. A estrutura em díploe (esponjosa entre duas camadas compactas) distribui forças de impacto.

2. **Suporte sensorial**: Abriga órbitas (visão), cavidades nasais (olfação) e canais auditivos (audição/equilíbrio).

3. **Cavidade pressurizada**: Contém LCR sob pressão controlada (5–15 mmHg). A hipertensão intracraniana é uma emergência.`,
    bloodSupply: "Artéria carótida interna, artéria meníngea média",
    venousDrainage: "Seios durais (sagital, transverso, sigmoide)",
    innervation: "Nervos cranianos I a XII emergem por forames da base",
    tags: ["crânio", "osso", "cabeça", "neurocrânio", "calvária", "suturas"],
  },
  {
    slug: "thorax",
    name: "Caixa Torácica",
    scientificName: "Cavea thoracis",
    commonNames: ["tórax", "caixa torácica", "gradil costal"],
    category: "BONE" as const,
    system: "SKELETAL" as const,
    region: "THORAX" as const,
    side: "MIDLINE" as const,
    modelId: "thorax",
    difficulty: "BASIC" as const,
    summary:
      "A caixa torácica é a estrutura osteocartilaginosa que protege o coração e os pulmões. É formada por **12 pares de costelas**, o **esterno** e as **12 vértebras torácicas**, funcionando também como peça-chave da respiração.",
    anatomyDetail: `## Componentes
- **Esterno**: manúbrio, corpo e processo xifoide
- **Costelas (12 pares):**
  - Verdadeiras (1–7): articulam diretamente com o esterno
  - Falsas (8–10): articulam via cartilagem da 7ª
  - Flutuantes (11–12): não articulam anteriormente
- **Vértebras torácicas (T1–T12)**

## Ângulo de Louis
Articulação manúbrio-esternal, ponto de referência para a 2ª costela e o nível da bifurcação traqueal (carina).`,
    physiology: `**Mecânica respiratória:**
- Na **inspiração**, os músculos intercostais externos e o diafragma elevam as costelas (movimento de "alça de balde" e "braço de bomba"), aumentando o volume torácico e reduzindo a pressão intrapleural.
- Na **expiração** (passiva em repouso), o relaxamento muscular e a retração elástica pulmonar reduzem o volume.

A caixa torácica também protege órgãos vitais e fornece inserção para músculos respiratórios e da cintura escapular.`,
    bloodSupply: "Artérias intercostais posteriores (aorta) e anteriores (torácica interna)",
    venousDrainage: "Veias intercostais → ázigo/hemiázigo",
    innervation: "Nervos intercostais (T1–T11) e subcostal (T12)",
    tags: ["tórax", "costelas", "esterno", "caixa torácica", "respiração", "gradil costal"],
  },
  {
    slug: "pelvis",
    name: "Pelve",
    scientificName: "Pelvis",
    commonNames: ["pelve", "bacia", "quadril ósseo"],
    category: "BONE" as const,
    system: "SKELETAL" as const,
    region: "PELVIS" as const,
    side: "MIDLINE" as const,
    modelId: "pelvis",
    difficulty: "INTERMEDIATE" as const,
    summary:
      "A pelve é o anel ósseo que conecta o tronco aos membros inferiores. É formada pelos dois **ossos do quadril** (ílio, ísquio e púbis fundidos), o **sacro** e o **cóccix**. Sustenta o peso corporal e protege os órgãos pélvicos.",
    anatomyDetail: `## Ossos
- **Osso do quadril** (coxal): fusão de ílio + ísquio + púbis no acetábulo
- **Sacro**: 5 vértebras sacrais fundidas
- **Cóccix**: 3–5 vértebras rudimentares

## Diferenças sexuais
| Característica | Masculina | Feminina |
|---|---|---|
| Abertura superior | Coração | Oval/arredondada |
| Ângulo subpúbico | <70° | >80° |
| Cavidade | Estreita/profunda | Larga/rasa |

A pelve feminina é adaptada ao parto (maior diâmetro do canal).`,
    physiology: `Funções principais:
1. **Transmissão de carga**: transfere o peso do esqueleto axial para os fêmures através das articulações sacroilíacas e do acetábulo.
2. **Proteção**: bexiga, reto e órgãos reprodutivos internos.
3. **Inserção muscular**: glúteos, adutores, assoalho pélvico.
4. **Parto**: na mulher, o canal pélvico é a via de passagem fetal.`,
    bloodSupply: "Artérias ilíacas internas (hipogástricas)",
    venousDrainage: "Plexo venoso pélvico → veias ilíacas internas",
    innervation: "Plexo sacral, plexo lombar",
    tags: ["pelve", "bacia", "quadril", "sacro", "ílio", "ísquio", "púbis", "acetábulo"],
  },
  {
    slug: "femur",
    name: "Fêmur",
    scientificName: "Os femoris",
    commonNames: ["fêmur", "osso da coxa"],
    category: "BONE" as const,
    system: "SKELETAL" as const,
    region: "LOWER_LIMB_THIGH" as const,
    side: "BILATERAL" as const,
    modelId: "femur",
    difficulty: "BASIC" as const,
    summary:
      "O fêmur é o osso mais longo e resistente do corpo humano, localizado na coxa. Articula-se proximalmente com o acetábulo (articulação coxofemoral) e distalmente com a tíbia e a patela (joelho).",
    anatomyDetail: `## Extremidade proximal
- **Cabeça**: 2/3 de esfera, recoberta de cartilagem exceto na fóvea
- **Colo**: forma ângulo de **126°** com a diáfise
- **Trocânter maior**: inserção do glúteo médio e mínimo
- **Trocânter menor**: inserção do iliopsoas

## Diáfise
- Linha áspera (linea aspera): inserção de extensores e adutores

## Extremidade distal
- **Côndilos medial e lateral**: articulam com a tíbia
- **Epicôndilos**: origens dos ligamentos colaterais`,
    physiology: `O fêmur suporta **forças de 3-5x o peso corporal** durante a marcha (até 8x na corrida).

**Biomecânica do colo femoral:**
- Ângulo de inclinação normal: 126° (adulto)
- **Coxa vara** (<120°): encurtamento do membro, marcha de Trendelenburg
- **Coxa valga** (>135°): predispõe a lesões ligamentares`,
    bloodSupply:
      "Artéria circunflexa femoral medial (principal), artéria circunflexa femoral lateral",
    venousDrainage: "Veias femorais",
    innervation: "Nervo femoral (ramos articulares)",
    tags: ["fêmur", "osso", "coxa", "membro inferior", "quadril", "joelho"],
  },
  {
    slug: "tibia",
    name: "Tíbia",
    scientificName: "Tibia",
    commonNames: ["tíbia", "osso da canela"],
    category: "BONE" as const,
    system: "SKELETAL" as const,
    region: "LOWER_LIMB_LEG" as const,
    side: "BILATERAL" as const,
    modelId: "tibia",
    difficulty: "BASIC" as const,
    summary:
      "A tíbia é o segundo osso mais longo do corpo e o principal osso de sustentação de carga da perna. Articula-se com o fêmur (joelho), a fíbula e o tálus (tornozelo). Sua margem anterior forma a 'canela'.",
    anatomyDetail: `## Extremidade proximal
- **Côndilos medial e lateral**: platô tibial, articulam com o fêmur
- **Eminência intercondilar**: fixação dos ligamentos cruzados
- **Tuberosidade da tíbia**: inserção do ligamento patelar

## Diáfise
- Margem anterior (crista da tíbia) — subcutânea, palpável
- Superfície medial — subcutânea (sítio de fraturas expostas)

## Extremidade distal
- **Maléolo medial**: saliência interna do tornozelo
- Face articular para o tálus`,
    physiology: `A tíbia transmite praticamente todo o peso corporal do joelho ao tornozelo (a fíbula suporta apenas ~10%).

O **platô tibial** distribui as cargas femorais através dos meniscos. A margem anterior subcutânea torna a tíbia vulnerável a fraturas expostas e à síndrome compartimental.`,
    bloodSupply: "Artéria tibial anterior e posterior (ramos da poplítea)",
    venousDrainage: "Veias tibiais → veia poplítea",
    innervation: "Nervo fibular e tibial (ramos)",
    tags: ["tíbia", "osso", "perna", "canela", "joelho", "tornozelo", "membro inferior"],
  },
  {
    slug: "humerus",
    name: "Úmero",
    scientificName: "Humerus",
    commonNames: ["úmero", "osso do braço"],
    category: "BONE" as const,
    system: "SKELETAL" as const,
    region: "UPPER_LIMB_ARM" as const,
    side: "BILATERAL" as const,
    modelId: "humerus",
    difficulty: "INTERMEDIATE" as const,
    summary:
      "O úmero é o osso do braço, o mais longo do membro superior. Articula-se com a escápula (ombro) e com o rádio e a ulna (cotovelo). Tem relação clínica importante com nervos que se enrolam ao seu redor.",
    anatomyDetail: `## Extremidade proximal
- **Cabeça**: articula com a cavidade glenoidal da escápula
- **Colo cirúrgico**: local frequente de fratura (relação com nervo axilar)
- **Tubérculos maior e menor**: inserções do manguito rotador

## Diáfise
- **Sulco do nervo radial** (goteira radial): o nervo radial percorre a face posterior

## Extremidade distal
- **Tróclea e capítulo**: articulam com ulna e rádio
- **Epicôndilos medial e lateral**: o nervo ulnar passa atrás do epicôndilo medial ("osso da comédia")`,
    physiology: `O úmero serve de alavanca para os movimentos do braço e ponto de inserção para músculos do ombro e cotovelo.

**Correlações nervosas (alto valor em prova):**
- Fratura do **colo cirúrgico** → lesão do **nervo axilar** (deltoide)
- Fratura da **diáfise** → lesão do **nervo radial** (mão caída)
- Fratura do **epicôndilo medial** → lesão do **nervo ulnar** (mão em garra)`,
    bloodSupply: "Artéria braquial e circunflexas umerais",
    venousDrainage: "Veias braquiais e cefálica/basílica",
    innervation: "Ramos do plexo braquial",
    tags: ["úmero", "osso", "braço", "ombro", "cotovelo", "nervo radial", "membro superior"],
  },

  // ============================================================
  // MÚSCULOS E NERVOS
  // ============================================================
  {
    slug: "quadriceps-femoris",
    name: "Músculo Quadríceps Femoral",
    scientificName: "Musculus quadriceps femoris",
    commonNames: ["quadríceps", "quad"],
    category: "MUSCLE" as const,
    system: "MUSCULAR_SUPERFICIAL" as const,
    region: "LOWER_LIMB_THIGH" as const,
    side: "BILATERAL" as const,
    modelId: "muscular_superficial",
    difficulty: "INTERMEDIATE" as const,
    summary:
      "O quadríceps femoral é o mais volumoso músculo do corpo humano, formado por **4 cabeças**: reto femoral, vasto lateral, vasto medial e vasto intermédio. É o principal extensor do joelho.",
    physiology: `**Função principal:** Extensão do joelho (todas as cabeças) + flexão do quadril (apenas o reto femoral).

**VMO (Vasto Medial Oblíquo):** porção oblíqua fundamental para o tracking patelar — sua atrofia causa síndrome fêmoro-patelar.

Gera torques de até 300 Nm na extensão do joelho.`,
    bloodSupply: "Artéria femoral profunda (ramos perfurantes)",
    venousDrainage: "Veia femoral profunda",
    innervation: "Nervo femoral (L2, L3, L4)",
    tags: ["quadríceps", "músculo", "coxa", "extensão joelho", "membro inferior"],
  },
  {
    slug: "femoral-nerve",
    name: "Nervo Femoral",
    scientificName: "Nervus femoralis",
    commonNames: ["nervo femoral"],
    category: "NERVE" as const,
    system: "NERVOUS" as const,
    region: "LOWER_LIMB_THIGH" as const,
    side: "BILATERAL" as const,
    modelId: "nervous",
    difficulty: "ADVANCED" as const,
    summary:
      "O nervo femoral é o maior nervo do plexo lombar (L2-L4). Inerva o quadríceps, sartório e pectíneo, além da face anterior-medial da coxa e perna (via nervo safeno).",
    physiology: `**Função motora:** flexão do quadril (iliopsoas, sartório) + extensão do joelho (quadríceps).

**Função sensitiva:** face anterior da coxa e, via nervo safeno, a face medial da perna e pé.

**Lesão femoral:**
- Fraqueza na extensão do joelho
- Dificuldade de subir escadas
- Reflexo patelar abolido (L4)`,
    bloodSupply: "Ramos da artéria femoral",
    venousDrainage: "Veias satélites",
    innervation: "Raízes L2, L3, L4 (plexo lombar)",
    tags: ["nervo femoral", "nervo", "plexo lombar", "coxa", "membro inferior"],
  },

  // ============================================================
  // ÓRGÃOS (pesquisáveis na busca)
  // ============================================================
  {
    slug: "heart",
    name: "Coração",
    scientificName: "Cor",
    commonNames: ["coração", "miocárdio"],
    category: "ORGAN" as const,
    system: "CARDIOVASCULAR" as const,
    region: "THORAX" as const,
    side: "MIDLINE" as const,
    modelId: "heart",
    difficulty: "INTERMEDIATE" as const,
    summary:
      "O coração é um órgão muscular oco, do tamanho de um punho, situado no mediastino médio. Funciona como uma **bomba dupla** que impulsiona o sangue pelas circulações pulmonar e sistêmica. Possui 4 câmaras: 2 átrios e 2 ventrículos.",
    anatomyDetail: `## Câmaras e valvas
- **Átrio direito** → (valva tricúspide) → **Ventrículo direito** → (valva pulmonar) → artéria pulmonar
- **Átrio esquerdo** → (valva mitral) → **Ventrículo esquerdo** → (valva aórtica) → aorta

## Camadas
- Endocárdio (interna)
- Miocárdio (muscular)
- Epicárdio (visceral do pericárdio)

## Sistema de condução
Nó sinoatrial (marca-passo) → nó atrioventricular → feixe de His → fibras de Purkinje`,
    physiology: `O coração bate ~100.000 vezes/dia, bombeando cerca de **5 litros/min** (débito cardíaco) em repouso.

**Ciclo cardíaco:**
- **Sístole**: contração ventricular, ejeção de sangue
- **Diástole**: relaxamento e enchimento

O **nó sinoatrial** gera o impulso (60-100 bpm) de forma autônoma (automatismo cardíaco), modulado pelo sistema nervoso autônomo.`,
    bloodSupply: "Artérias coronárias direita e esquerda (ramos da aorta ascendente)",
    venousDrainage: "Seio coronário → átrio direito",
    innervation: "Plexo cardíaco (simpático e parassimpático/vago)",
    tags: ["coração", "cardíaco", "miocárdio", "válvulas", "coronárias", "circulação"],
  },
  {
    slug: "lungs",
    name: "Pulmões",
    scientificName: "Pulmones",
    commonNames: ["pulmão", "pulmões"],
    category: "ORGAN" as const,
    system: "RESPIRATORY" as const,
    region: "THORAX" as const,
    side: "BILATERAL" as const,
    modelId: "lungs",
    difficulty: "INTERMEDIATE" as const,
    summary:
      "Os pulmões são os órgãos esponjosos da respiração, onde ocorrem as trocas gasosas. O **pulmão direito** tem 3 lobos e o **esquerdo** 2 lobos (espaço para o coração). A unidade funcional é o **alvéolo**.",
    anatomyDetail: `## Lobos e fissuras
- **Direito**: 3 lobos (superior, médio, inferior) — fissuras oblíqua e horizontal
- **Esquerdo**: 2 lobos (superior, inferior) — fissura oblíqua; possui a **incisura cardíaca** e a **língula**

## Árvore brônquica
Traqueia → brônquios principais → lobares → segmentares → bronquíolos → bronquíolos terminais → alvéolos

## Pleura
Membrana dupla (parietal e visceral) com líquido pleural que reduz o atrito.`,
    physiology: `As trocas gasosas ocorrem na **membrana alvéolo-capilar** (~0,5 µm de espessura, ~70 m² de área total).

- **O₂** difunde do alvéolo para o sangue
- **CO₂** difunde do sangue para o alvéolo

A ventilação (~12-16 irpm em repouso) é controlada pelo **centro respiratório bulbar**, sensível ao CO₂ e ao pH do LCR.`,
    bloodSupply: "Artérias pulmonares (gás) + artérias brônquicas (nutrição)",
    venousDrainage: "Veias pulmonares → átrio esquerdo",
    innervation: "Plexo pulmonar (vago e simpático)",
    tags: ["pulmão", "pulmões", "respiração", "alvéolo", "brônquios", "trocas gasosas", "pleura"],
  },
  {
    slug: "liver",
    name: "Fígado",
    scientificName: "Hepar",
    commonNames: ["fígado", "hepático"],
    category: "ORGAN" as const,
    system: "DIGESTIVE" as const,
    region: "ABDOMEN" as const,
    side: "RIGHT" as const,
    modelId: "liver",
    difficulty: "INTERMEDIATE" as const,
    summary:
      "O fígado é a maior glândula do corpo (~1,5 kg), localizado no hipocôndrio direito. Desempenha mais de 500 funções metabólicas, incluindo produção de bile, detoxificação e síntese de proteínas plasmáticas.",
    anatomyDetail: `## Lobos
- Lobos anatômicos: direito, esquerdo, quadrado e caudado
- Divisão funcional: 8 segmentos de Couinaud (base para cirurgias)

## Ligamentos
- Falciforme (liga ao diafragma e parede), redondo (resquício da veia umbilical)

## Hilo hepático (porta hepatis)
Entrada da artéria hepática e veia porta, saída do ducto hepático comum.`,
    physiology: `**Funções principais:**
1. **Metabólica**: glicogênese/glicogenólise, gliconeogênese, metabolismo lipídico
2. **Síntese**: albumina, fatores de coagulação, proteínas de transporte
3. **Bile**: produção (~1 L/dia) para emulsificação de gorduras
4. **Detoxificação**: amônia → ureia; metabolismo de fármacos (citocromo P450)
5. **Armazenamento**: glicogênio, vitaminas A, D, B12, ferro

A **circulação porta** traz sangue rico em nutrientes do trato GI para processamento.`,
    bloodSupply: "Dupla: artéria hepática (~25%) e veia porta (~75%)",
    venousDrainage: "Veias hepáticas → veia cava inferior",
    innervation: "Plexo hepático (simpático e vago)",
    tags: ["fígado", "hepático", "bile", "metabolismo", "veia porta", "detoxificação"],
  },
  {
    slug: "brain",
    name: "Encéfalo",
    scientificName: "Encephalon",
    commonNames: ["cérebro", "encéfalo", "massa cinzenta"],
    category: "ORGAN" as const,
    system: "NERVOUS" as const,
    region: "HEAD" as const,
    side: "MIDLINE" as const,
    modelId: "brain",
    difficulty: "ADVANCED" as const,
    summary:
      "O encéfalo é o centro de controle do sistema nervoso, contido no crânio. Compõe-se de **cérebro** (hemisférios), **cerebelo** e **tronco encefálico**. Contém ~86 bilhões de neurônios.",
    anatomyDetail: `## Divisões
- **Cérebro**: 2 hemisférios, 4 lobos (frontal, parietal, temporal, occipital)
- **Cerebelo**: coordenação motora e equilíbrio
- **Tronco encefálico**: mesencéfalo, ponte, bulbo

## Áreas funcionais
- Lobo frontal: motricidade, planejamento, área de Broca (fala)
- Lobo parietal: sensibilidade somática
- Lobo temporal: audição, memória, área de Wernicke
- Lobo occipital: visão

## Proteção
Meninges (dura, aracnoide, pia) + LCR + barreira hematoencefálica`,
    physiology: `O encéfalo consome **~20% do oxigênio** e da glicose corporais, apesar de representar 2% do peso.

**Funções:** processamento sensorial, controle motor, cognição, emoção, memória, regulação autonômica (tronco) e homeostase (hipotálamo).

O fluxo sanguíneo cerebral é rigorosamente autorregulado (~50 mL/100g/min). Interrupção por >4-5 min causa lesão irreversível.`,
    bloodSupply: "Polígono de Willis (carótidas internas + artérias vertebrais)",
    venousDrainage: "Seios venosos durais → veias jugulares internas",
    innervation: "Sistema nervoso central (próprio)",
    tags: ["cérebro", "encéfalo", "neurônio", "hemisférios", "cerebelo", "tronco", "lobos"],
  },
  {
    slug: "stomach",
    name: "Estômago",
    scientificName: "Gaster / Ventriculus",
    commonNames: ["estômago", "gástrico"],
    category: "ORGAN" as const,
    system: "DIGESTIVE" as const,
    region: "ABDOMEN" as const,
    side: "LEFT" as const,
    modelId: "stomach",
    difficulty: "BASIC" as const,
    summary:
      "O estômago é a porção dilatada do tubo digestório entre o esôfago e o duodeno, no hipocôndrio esquerdo/epigástrio. Realiza digestão mecânica e química dos alimentos por meio do suco gástrico.",
    anatomyDetail: `## Regiões
- **Cárdia**: junção com o esôfago
- **Fundo**: porção superior (acumula gases)
- **Corpo**: porção principal
- **Antro pilórico** → **piloro** (esfíncter para o duodeno)

## Curvaturas
- Curvatura menor (direita) e maior (esquerda)

## Camadas musculares
Possui 3 camadas (oblíqua, circular, longitudinal) — única no tubo digestório.`,
    physiology: `O estômago secreta o **suco gástrico** (2-3 L/dia):
- **HCl** (células parietais): pH 1,5-3,5, ativa pepsina e mata micro-organismos
- **Pepsinogênio** (células principais): digestão proteica
- **Fator intrínseco**: absorção de B12
- **Muco** (células mucosas): proteção da própria mucosa

O **peristaltismo** mistura o bolo alimentar formando o **quimo**, liberado em porções ao duodeno.`,
    bloodSupply: "Tronco celíaco (artérias gástricas, gastromentais, esplênica)",
    venousDrainage: "Veias gástricas → sistema porta",
    innervation: "Nervo vago (parassimpático) e plexo celíaco (simpático)",
    tags: ["estômago", "gástrico", "digestão", "HCl", "pepsina", "piloro", "quimo"],
  },
  {
    slug: "kidney",
    name: "Rim",
    scientificName: "Ren",
    commonNames: ["rim", "rins", "renal"],
    category: "ORGAN" as const,
    system: "URINARY" as const,
    region: "ABDOMEN" as const,
    side: "BILATERAL" as const,
    modelId: "kidney",
    difficulty: "INTERMEDIATE" as const,
    summary:
      "Os rins são dois órgãos retroperitoneais em forma de feijão que filtram o sangue, produzindo urina. Regulam o equilíbrio hidroeletrolítico, a pressão arterial e o pH. A unidade funcional é o **néfron** (~1 milhão por rim).",
    anatomyDetail: `## Estrutura
- **Córtex** (externo) e **medula** (pirâmides renais)
- **Néfron**: corpúsculo renal (glomérulo + cápsula de Bowman) + túbulos
- **Pelve renal** → ureter

## Posição
Retroperitoneais, entre T12 e L3. O rim direito é levemente mais baixo (fígado).

## Hilo renal
Entrada da artéria renal, saída da veia renal e do ureter.`,
    physiology: `Os rins filtram **~180 L/dia** de plasma, reabsorvendo 99% (urina final ~1,5 L/dia).

**Funções:**
1. **Filtração glomerular** (TFG ~120 mL/min)
2. **Reabsorção/secreção tubular**: ajuste fino de água, Na⁺, K⁺, glicose
3. **Regulação da PA**: sistema renina-angiotensina-aldosterona
4. **Equilíbrio ácido-base**: excreção de H⁺, reabsorção de bicarbonato
5. **Endócrina**: eritropoetina (hemácias) e ativação da vitamina D`,
    bloodSupply: "Artérias renais (ramos diretos da aorta abdominal)",
    venousDrainage: "Veias renais → veia cava inferior",
    innervation: "Plexo renal (simpático)",
    tags: ["rim", "rins", "renal", "néfron", "filtração", "urina", "glomérulo"],
  },
];

// ================================================================
// OSSOS ADICIONAIS — cada osso clicável no esqueleto 3D
// ================================================================
const EXTRA_BONES: Prisma.AnatomicalStructureCreateInput[] = [
  {
    slug: "mandible", name: "Mandíbula", scientificName: "Mandibula",
    commonNames: ["mandíbula", "maxilar inferior", "queixo"],
    category: "BONE", system: "SKELETAL", region: "HEAD", side: "MIDLINE",
    modelId: "mandible", difficulty: "BASIC",
    summary: "A mandíbula é o **único osso móvel do crânio** e o mais forte da face. Aloja os dentes inferiores e forma a articulação temporomandibular (ATM) com o osso temporal, permitindo a mastigação e a fala.",
    anatomyDetail: "## Partes\n- **Corpo**: porção horizontal, em forma de ferradura, com os alvéolos dentários\n- **Ramos**: porções verticais posteriores\n- **Côndilo (cabeça)**: articula com a fossa mandibular do temporal (ATM)\n- **Processo coronoide**: inserção do músculo temporal\n- **Forame mentual**: passagem do nervo mentual",
    physiology: "Movimentos da mandíbula na ATM: elevação (fechar a boca), depressão (abrir), protrusão, retrusão e lateralidade — essenciais para a mastigação. Os músculos da mastigação (masseter, temporal, pterigóideos) movem a mandíbula.",
    bloodSupply: "Artéria alveolar inferior (ramo da maxilar)",
    venousDrainage: "Plexo pterigóideo", innervation: "Nervo alveolar inferior (V3, ramo do trigêmeo)",
    tags: ["mandíbula", "ATM", "mastigação", "face", "queixo", "dentes"],
  },
  {
    slug: "hyoid", name: "Osso Hioide", scientificName: "Os hyoideum",
    commonNames: ["hioide", "osso da língua"],
    category: "BONE", system: "SKELETAL", region: "NECK", side: "MIDLINE",
    modelId: "hyoid", difficulty: "INTERMEDIATE",
    summary: "O hioide é um osso em forma de **U** localizado no pescoço, sendo o **único osso do corpo que não se articula com nenhum outro osso** — fica suspenso por músculos e ligamentos. Serve de âncora para a língua e músculos do pescoço.",
    anatomyDetail: "## Partes\n- **Corpo**: porção central\n- **Cornos maiores**: projeções posteriores\n- **Cornos menores**: pequenas projeções superiores\n\nLocaliza-se ao nível da vértebra C3, acima da cartilagem tireóidea.",
    physiology: "Funciona como ponto de fixação para os músculos supra e infra-hióideos, participando da **deglutição** e da **fonação**. Sua elevação durante a deglutição ajuda a fechar a laringe.",
    bloodSupply: "Artéria lingual e tireóidea superior", venousDrainage: "Veias tireóideas",
    innervation: "Alça cervical e nervo hipoglosso (músculos associados)",
    tags: ["hioide", "pescoço", "língua", "deglutição", "fonação"],
  },
  {
    slug: "cervical-vertebrae", name: "Vértebras Cervicais", scientificName: "Vertebrae cervicales (C1-C7)",
    commonNames: ["vértebras cervicais", "coluna cervical", "pescoço"],
    category: "BONE", system: "SKELETAL", region: "SPINE", side: "MIDLINE",
    modelId: "cervical-vertebrae", difficulty: "INTERMEDIATE",
    summary: "As 7 vértebras cervicais (C1-C7) formam a porção mais móvel da coluna, sustentando o crânio. Destacam-se **C1 (Atlas)** e **C2 (Áxis)**, que permitem os movimentos de afirmação e negação da cabeça.",
    anatomyDetail: "## Vértebras especiais\n- **C1 (Atlas)**: sem corpo nem processo espinhoso; sustenta o crânio (articulação atlantoccipital — \"sim\")\n- **C2 (Áxis)**: possui o **dente (processo odontoide)**, eixo de rotação (\"não\")\n- **C7 (vértebra proeminente)**: processo espinhoso longo e palpável\n\n## Característica única\nPossuem **forames transversários** que dão passagem às artérias vertebrais.",
    physiology: "Permitem flexão, extensão, rotação e inclinação lateral da cabeça e pescoço. As artérias vertebrais passam pelos forames transversários para irrigar o encéfalo.",
    bloodSupply: "Artérias vertebrais e cervicais", venousDrainage: "Plexos venosos vertebrais",
    innervation: "Nervos espinhais cervicais (C1-C8)",
    tags: ["vértebras cervicais", "atlas", "áxis", "pescoço", "coluna", "C1", "C2"],
  },
  {
    slug: "thoracic-vertebrae", name: "Vértebras Torácicas", scientificName: "Vertebrae thoracicae (T1-T12)",
    commonNames: ["vértebras torácicas", "coluna torácica", "dorsais"],
    category: "BONE", system: "SKELETAL", region: "SPINE", side: "MIDLINE",
    modelId: "thoracic-vertebrae", difficulty: "INTERMEDIATE",
    summary: "As 12 vértebras torácicas (T1-T12) articulam-se com as costelas, formando a parte posterior da caixa torácica. Caracterizam-se pelas **fóveas costais** e por processos espinhosos longos e inclinados para baixo.",
    anatomyDetail: "## Características\n- **Fóveas costais** no corpo e nos processos transversos: articulação com as costelas\n- **Processos espinhosos longos** e oblíquos, sobrepostos como telhas\n- Forames vertebrais relativamente pequenos e circulares\n\nA curvatura torácica é uma **cifose** primária (côncava anteriormente).",
    physiology: "A articulação com as costelas limita a mobilidade, conferindo estabilidade e protegendo os órgãos torácicos. Participam dos movimentos respiratórios da caixa torácica.",
    bloodSupply: "Artérias intercostais posteriores", venousDrainage: "Plexos venosos vertebrais → ázigo",
    innervation: "Nervos espinhais torácicos (T1-T12)",
    tags: ["vértebras torácicas", "coluna", "costelas", "cifose", "dorso"],
  },
  {
    slug: "lumbar-vertebrae", name: "Vértebras Lombares", scientificName: "Vertebrae lumbales (L1-L5)",
    commonNames: ["vértebras lombares", "coluna lombar", "lombar"],
    category: "BONE", system: "SKELETAL", region: "SPINE", side: "MIDLINE",
    modelId: "lumbar-vertebrae", difficulty: "INTERMEDIATE",
    summary: "As 5 vértebras lombares (L1-L5) são as **maiores e mais robustas** da coluna móvel, suportando grande parte do peso corporal. Local mais comum de hérnias de disco e lombalgia.",
    anatomyDetail: "## Características\n- **Corpos vertebrais grandes** e em forma de rim\n- Processos espinhosos curtos, espessos e horizontais (em \"machadinha\")\n- Ausência de fóveas costais e de forames transversários\n\nA curvatura lombar é uma **lordose** secundária (côncava posteriormente).",
    physiology: "Suportam e distribuem o peso do tronco. Permitem flexão e extensão amplas, mas pouca rotação. A sobrecarga e a degeneração discal nesta região causam a maioria das dores lombares.",
    bloodSupply: "Artérias lombares (aorta abdominal)", venousDrainage: "Plexos venosos vertebrais → veia cava inferior",
    innervation: "Nervos espinhais lombares (L1-L5)",
    tags: ["vértebras lombares", "lombar", "coluna", "lordose", "hérnia de disco", "lombalgia"],
  },
  {
    slug: "sacrum", name: "Sacro", scientificName: "Os sacrum",
    commonNames: ["sacro", "osso sacro"],
    category: "BONE", system: "SKELETAL", region: "PELVIS", side: "MIDLINE",
    modelId: "sacrum", difficulty: "INTERMEDIATE",
    summary: "O sacro é um osso triangular formado pela **fusão de 5 vértebras sacrais**. Forma a parede posterior da pelve, articulando-se com os ossos do quadril (articulações sacroilíacas) e transmitindo o peso do corpo aos membros inferiores.",
    anatomyDetail: "## Características\n- **Base**: articula com L5 (promontório sacral)\n- **Ápice**: articula com o cóccix\n- **Forames sacrais**: passagem dos nervos sacrais\n- **Canal sacral**: continuação do canal vertebral (termina no hiato sacral)\n- **Face auricular**: articulação sacroilíaca",
    physiology: "Transfere o peso do esqueleto axial para a pelve e os membros inferiores. O hiato sacral é via de acesso para a **anestesia caudal/peridural**.",
    bloodSupply: "Artérias sacrais mediana e laterais", venousDrainage: "Plexo venoso sacral",
    innervation: "Nervos sacrais (plexo sacral)",
    tags: ["sacro", "pelve", "sacroilíaca", "coluna", "anestesia caudal"],
  },
  {
    slug: "coccyx", name: "Cóccix", scientificName: "Os coccygis",
    commonNames: ["cóccix", "osso do cóccix", "rabo"],
    category: "BONE", system: "SKELETAL", region: "PELVIS", side: "MIDLINE",
    modelId: "coccyx", difficulty: "BASIC",
    summary: "O cóccix é o pequeno osso terminal da coluna, formado pela fusão de **3 a 5 vértebras coccígeas** rudimentares. É o vestígio da cauda e serve de inserção para músculos do assoalho pélvico.",
    anatomyDetail: "## Características\n- Osso triangular, vestigial\n- Articula-se com o ápice do sacro\n- Inserção dos músculos: levantador do ânus, glúteo máximo e ligamento anococcígeo",
    physiology: "Serve de apoio e ponto de fixação para músculos do assoalho pélvico. Traumas (quedas) podem causar **coccidínia** (dor intensa ao sentar).",
    bloodSupply: "Artéria sacral mediana", venousDrainage: "Plexo venoso sacral",
    innervation: "Plexo coccígeo (S4-S5, Co)",
    tags: ["cóccix", "pelve", "coccidínia", "assoalho pélvico", "coluna"],
  },
  {
    slug: "sternum", name: "Esterno", scientificName: "Sternum",
    commonNames: ["esterno", "osso do peito"],
    category: "BONE", system: "SKELETAL", region: "THORAX", side: "MIDLINE",
    modelId: "sternum", difficulty: "BASIC",
    summary: "O esterno é um osso plano no centro do tórax que se articula com as clavículas e as costelas, fechando a caixa torácica anteriormente. É referência para a **reanimação cardiopulmonar (RCP)**.",
    anatomyDetail: "## Três partes\n- **Manúbrio**: porção superior; articula com clavícula e 1ª costela\n- **Corpo**: porção média; articula com costelas 2-7\n- **Processo xifoide**: ponta cartilaginosa inferior\n\n## Ângulo do esterno (de Louis)\nJunção manúbrio-corpo, ao nível da **2ª costela** e da bifurcação traqueal.",
    physiology: "Protege o coração e os grandes vasos. A compressão do esterno sobre o coração é a base da RCP. A medula óssea do esterno é local de **punção (mielograma)**.",
    bloodSupply: "Artéria torácica interna", venousDrainage: "Veias torácicas internas",
    innervation: "Nervos intercostais", tags: ["esterno", "tórax", "RCP", "manúbrio", "xifoide", "peito"],
  },
  {
    slug: "ribs", name: "Costelas", scientificName: "Costae",
    commonNames: ["costelas", "arcos costais"],
    category: "BONE", system: "SKELETAL", region: "THORAX", side: "BILATERAL",
    modelId: "ribs", difficulty: "BASIC",
    summary: "As costelas são **12 pares** de ossos curvos e planos que formam as paredes da caixa torácica, protegendo coração e pulmões e participando da respiração.",
    anatomyDetail: "## Classificação\n- **Verdadeiras (1-7)**: articulam diretamente com o esterno\n- **Falsas (8-10)**: articulam via cartilagem da 7ª costela\n- **Flutuantes (11-12)**: extremidade anterior livre\n\n## Sulco costal\nNa margem inferior interna, aloja o **feixe neurovascular intercostal** (veia, artéria e nervo — VAN).",
    physiology: "Na inspiração, a elevação das costelas aumenta o volume torácico (movimentos de \"alça de balde\" e \"braço de bomba\"). A punção torácica deve ser feita na **borda superior** da costela para evitar o feixe neurovascular.",
    bloodSupply: "Artérias intercostais", venousDrainage: "Veias intercostais → ázigo/hemiázigo",
    innervation: "Nervos intercostais (T1-T11)", tags: ["costelas", "tórax", "respiração", "arco costal", "intercostal"],
  },
  {
    slug: "clavicle", name: "Clavícula", scientificName: "Clavicula",
    commonNames: ["clavícula", "osso do colarinho"],
    category: "BONE", system: "SKELETAL", region: "UPPER_LIMB_SHOULDER", side: "BILATERAL",
    modelId: "clavicle", difficulty: "BASIC",
    summary: "A clavícula é um osso longo em forma de **S** que conecta o membro superior ao esqueleto axial. É o **osso mais frequentemente fraturado** do corpo e o primeiro a ossificar no feto.",
    anatomyDetail: "## Articulações\n- **Medial (esternal)**: com o manúbrio (articulação esternoclavicular)\n- **Lateral (acromial)**: com o acrômio da escápula (articulação acromioclavicular)\n\nO terço médio é o ponto mais frágil e local mais comum de fratura.",
    physiology: "Atua como **escora** que mantém o membro superior afastado do tronco, permitindo amplitude de movimento ao ombro. Transmite forças do membro ao esqueleto axial.",
    bloodSupply: "Artéria supraescapular e toracoacromial", venousDrainage: "Veia subclávia",
    innervation: "Nervos supraclaviculares", tags: ["clavícula", "ombro", "fratura", "colarinho", "membro superior"],
  },
  {
    slug: "scapula", name: "Escápula", scientificName: "Scapula",
    commonNames: ["escápula", "omoplata", "pá do ombro"],
    category: "BONE", system: "SKELETAL", region: "UPPER_LIMB_SHOULDER", side: "BILATERAL",
    modelId: "scapula", difficulty: "INTERMEDIATE",
    summary: "A escápula (omoplata) é um osso triangular e plano que conecta o úmero à clavícula, formando o ombro. Serve de inserção para 17 músculos e abriga a cavidade glenoidal.",
    anatomyDetail: "## Estruturas\n- **Cavidade glenoidal**: articula com a cabeça do úmero (articulação do ombro)\n- **Espinha da escápula**: crista posterior que termina no **acrômio**\n- **Processo coracoide**: projeção anterior (inserção muscular)\n- **Fossas supra e infraespinhal**: alojam músculos do manguito rotador",
    physiology: "Move-se livremente sobre a parede torácica (ritmo escapuloumeral), ampliando enormemente a mobilidade do ombro. Estabilizada por músculos (serrátil anterior, trapézio).",
    bloodSupply: "Artérias supraescapular e circunflexa da escápula", venousDrainage: "Veias homônimas",
    innervation: "Nervos do plexo braquial", tags: ["escápula", "omoplata", "ombro", "glenoide", "acrômio", "manguito rotador"],
  },
  {
    slug: "radius", name: "Rádio", scientificName: "Radius",
    commonNames: ["rádio"],
    category: "BONE", system: "SKELETAL", region: "UPPER_LIMB_FOREARM", side: "BILATERAL",
    modelId: "radius", difficulty: "BASIC",
    summary: "O rádio é o osso **lateral (do lado do polegar)** do antebraço. É o principal responsável pela articulação do punho e pelos movimentos de pronação e supinação.",
    anatomyDetail: "## Partes\n- **Cabeça**: articula com o capítulo do úmero e a ulna\n- **Tuberosidade do rádio**: inserção do bíceps braquial\n- **Extremidade distal**: articula com os ossos do carpo e a ulna; possui o **processo estiloide**\n\nA **fratura de Colles** (extremidade distal) é a fratura mais comum do punho.",
    physiology: "Durante a **pronação/supinação**, o rádio gira em torno da ulna (que permanece fixa). Transmite a maior parte da carga do punho ao cotovelo.",
    bloodSupply: "Artéria radial", venousDrainage: "Veias radiais", innervation: "Nervo radial",
    tags: ["rádio", "antebraço", "punho", "pronação", "supinação", "fratura de colles"],
  },
  {
    slug: "ulna", name: "Ulna", scientificName: "Ulna",
    commonNames: ["ulna", "cúbito"],
    category: "BONE", system: "SKELETAL", region: "UPPER_LIMB_FOREARM", side: "BILATERAL",
    modelId: "ulna", difficulty: "BASIC",
    summary: "A ulna é o osso **medial** do antebraço (lado do dedo mínimo). Forma a principal articulação do cotovelo com o úmero, sendo o osso estabilizador do antebraço.",
    anatomyDetail: "## Partes\n- **Olécrano**: proeminência posterior do cotovelo (\"cotovelo\")\n- **Incisura troclear**: encaixa na tróclea do úmero (articulação em dobradiça)\n- **Processo coronoide**\n- **Cabeça** e **processo estiloide** distais\n\nO nervo ulnar passa atrás do epicôndilo medial, próximo ao olécrano.",
    physiology: "Forma a articulação do cotovelo (em gínglimo/dobradiça) com o úmero, permitindo flexão e extensão. Serve de eixo fixo para a rotação do rádio.",
    bloodSupply: "Artéria ulnar", venousDrainage: "Veias ulnares", innervation: "Nervo ulnar e mediano",
    tags: ["ulna", "cúbito", "antebraço", "cotovelo", "olécrano", "nervo ulnar"],
  },
  {
    slug: "carpals", name: "Ossos do Carpo", scientificName: "Ossa carpi",
    commonNames: ["ossos do carpo", "punho", "carpo"],
    category: "BONE", system: "SKELETAL", region: "UPPER_LIMB_HAND", side: "BILATERAL",
    modelId: "carpals", difficulty: "ADVANCED",
    summary: "O carpo é formado por **8 ossos curtos** dispostos em duas fileiras, que compõem o punho e conferem flexibilidade à mão. O **escafoide** é o mais fraturado.",
    anatomyDetail: "## Fileira proximal (lateral→medial)\nEscafoide, Semilunar (lunate), Piramidal (triquetral), Pisiforme\n## Fileira distal\nTrapézio, Trapezoide, Capitato, Hamato\n\n## Túnel do carpo\nOs carpais formam um arco que, com o retináculo dos flexores, cria o túnel do carpo (passagem do nervo mediano e tendões).",
    physiology: "Permitem os movimentos do punho (flexão, extensão, desvios). A fratura do **escafoide** tem risco de necrose avascular (irrigação retrógrada). A compressão do nervo mediano causa a **síndrome do túnel do carpo**.",
    bloodSupply: "Arcos arteriais radial e ulnar", venousDrainage: "Arcos venosos do punho",
    innervation: "Nervos mediano, ulnar e radial", tags: ["carpo", "punho", "escafoide", "túnel do carpo", "mão"],
  },
  {
    slug: "metacarpals", name: "Metacarpos", scientificName: "Ossa metacarpi",
    commonNames: ["metacarpos", "ossos da palma"],
    category: "BONE", system: "SKELETAL", region: "UPPER_LIMB_HAND", side: "BILATERAL",
    modelId: "metacarpals", difficulty: "BASIC",
    summary: "Os 5 metacarpos são os ossos longos da **palma da mão**, numerados de I (polegar) a V (mínimo). Conectam o carpo às falanges dos dedos.",
    anatomyDetail: "## Estrutura\nCada metacarpo possui base (proximal), corpo e cabeça (distal, forma os 'nós' dos dedos).\n\nA fratura da cabeça do 5º metacarpo é a **fratura do boxeador**.",
    physiology: "Formam a estrutura da palma e a articulação metacarpofalângica (os 'nós dos dedos'). O 1º metacarpo (polegar) tem grande mobilidade, permitindo a oposição.",
    bloodSupply: "Arcos palmares (radial e ulnar)", venousDrainage: "Arco venoso dorsal",
    innervation: "Nervos mediano e ulnar", tags: ["metacarpos", "mão", "palma", "fratura do boxeador", "dedos"],
  },
  {
    slug: "phalanges", name: "Falanges", scientificName: "Phalanges",
    commonNames: ["falanges", "ossos dos dedos", "dedos"],
    category: "BONE", system: "SKELETAL", region: "UPPER_LIMB_HAND", side: "BILATERAL",
    modelId: "phalanges", difficulty: "BASIC",
    summary: "As falanges são os ossos dos **dedos das mãos e dos pés**. Cada dedo tem 3 falanges (proximal, média e distal), exceto o polegar e o hálux, que têm apenas 2.",
    anatomyDetail: "## Contagem\n- **Mão**: 14 falanges por mão (3 em cada dedo, 2 no polegar)\n- **Pé**: 14 falanges por pé (3 em cada dedo, 2 no hálux)\n\nClassificadas em proximal, média (intermédia) e distal.",
    physiology: "Permitem os movimentos finos de preensão e manipulação (mãos) e o equilíbrio e propulsão na marcha (pés). As articulações interfalângicas funcionam como dobradiças.",
    bloodSupply: "Artérias digitais", venousDrainage: "Veias digitais",
    innervation: "Nervos digitais (mediano, ulnar; tibial no pé)",
    tags: ["falanges", "dedos", "mão", "pé", "hálux", "preensão"],
  },
  {
    slug: "patella", name: "Patela", scientificName: "Patella",
    commonNames: ["patela", "rótula"],
    category: "BONE", system: "SKELETAL", region: "LOWER_LIMB_THIGH", side: "BILATERAL",
    modelId: "patella", difficulty: "BASIC",
    summary: "A patela (rótula) é o **maior osso sesamoide** do corpo, situado no tendão do quadríceps, à frente do joelho. Aumenta a eficiência mecânica da extensão do joelho.",
    anatomyDetail: "## Características\n- Osso triangular, com ápice inferior\n- Face posterior articular (com a tróclea femoral)\n- Envolvida pelo tendão do quadríceps (acima) e ligamento patelar (abaixo)",
    physiology: "Funciona como uma **polia (fulcro)** que aumenta o braço de alavanca do quadríceps, potencializando a força de extensão do joelho em até 30%. Protege a articulação anteriormente.",
    bloodSupply: "Anastomose arterial do joelho", venousDrainage: "Veias do joelho",
    innervation: "Ramos do nervo femoral", tags: ["patela", "rótula", "joelho", "quadríceps", "sesamoide"],
  },
  {
    slug: "fibula", name: "Fíbula", scientificName: "Fibula",
    commonNames: ["fíbula", "perônio"],
    category: "BONE", system: "SKELETAL", region: "LOWER_LIMB_LEG", side: "BILATERAL",
    modelId: "fibula", difficulty: "BASIC",
    summary: "A fíbula (perônio) é o osso **lateral e delgado** da perna. Suporta pouca carga (~10%), mas é essencial para a estabilidade do tornozelo e serve de inserção muscular.",
    anatomyDetail: "## Partes\n- **Cabeça**: proximal, articula com a tíbia (relação com o nervo fibular comum)\n- **Corpo**\n- **Maléolo lateral**: forma a saliência externa do tornozelo\n\nO **nervo fibular comum** contorna o colo da fíbula — vulnerável a lesão (pé caído).",
    physiology: "Não sustenta peso significativo, mas estabiliza o tornozelo (maléolo lateral) e ancora músculos. É comumente usada como **enxerto ósseo** por ser dispensável estruturalmente.",
    bloodSupply: "Artéria fibular (peroneal)", venousDrainage: "Veias fibulares",
    innervation: "Nervo fibular comum", tags: ["fíbula", "perônio", "perna", "tornozelo", "maléolo", "nervo fibular"],
  },
  {
    slug: "calcaneus", name: "Calcâneo", scientificName: "Calcaneus",
    commonNames: ["calcâneo", "osso do calcanhar"],
    category: "BONE", system: "SKELETAL", region: "LOWER_LIMB_FOOT", side: "BILATERAL",
    modelId: "calcaneus", difficulty: "BASIC",
    summary: "O calcâneo é o **maior osso do pé**, formando o calcanhar. Recebe o tendão de Aquiles e sustenta o peso corporal na posição em pé e na marcha.",
    anatomyDetail: "## Características\n- Maior osso do tarso\n- **Tuberosidade do calcâneo**: inserção do tendão de Aquiles (calcâneo)\n- Articula com o tálus (acima) e o cuboide (à frente)\n- **Sustentáculo do tálus**: apoia o tálus",
    physiology: "Transmite o peso do corpo ao solo e atua como alavanca para os músculos da panturrilha (via tendão de Aquiles) na propulsão da marcha e na corrida. Local comum do **esporão do calcâneo** e da fascite plantar.",
    bloodSupply: "Artérias tibial posterior e fibular", venousDrainage: "Veias plantares",
    innervation: "Nervo tibial (ramos calcâneos)", tags: ["calcâneo", "calcanhar", "pé", "tendão de aquiles", "esporão"],
  },
  {
    slug: "talus", name: "Tálus", scientificName: "Talus",
    commonNames: ["tálus", "astrágalo"],
    category: "BONE", system: "SKELETAL", region: "LOWER_LIMB_FOOT", side: "BILATERAL",
    modelId: "talus", difficulty: "INTERMEDIATE",
    summary: "O tálus (astrágalo) é o osso que conecta a perna ao pé, formando a **articulação do tornozelo** com a tíbia e a fíbula. É o único osso do pé sem inserções musculares.",
    anatomyDetail: "## Características\n- **Tróclea**: articula com a tíbia e fíbula (tornozelo)\n- **Cabeça**: articula com o navicular\n- Apoia-se sobre o calcâneo\n\nGrande parte da superfície é cartilagem articular, o que limita a irrigação (risco de necrose avascular em fraturas).",
    physiology: "Distribui o peso corporal recebido da tíbia para o restante do pé (calcâneo e antepé). É o pivô central dos movimentos de dorsiflexão e flexão plantar do tornozelo.",
    bloodSupply: "Artéria tibial posterior, dorsal do pé e fibular", venousDrainage: "Veias do tornozelo",
    innervation: "Nervo fibular profundo (cápsula)", tags: ["tálus", "astrágalo", "tornozelo", "pé", "necrose avascular"],
  },
  {
    slug: "tarsals", name: "Ossos do Tarso", scientificName: "Ossa tarsi",
    commonNames: ["ossos do tarso", "tarso", "retropé"],
    category: "BONE", system: "SKELETAL", region: "LOWER_LIMB_FOOT", side: "BILATERAL",
    modelId: "tarsals", difficulty: "INTERMEDIATE",
    summary: "O tarso é formado por **7 ossos curtos** que compõem o retropé e o mediopé: tálus, calcâneo, navicular, cuboide e os três cuneiformes. Formam os arcos do pé.",
    anatomyDetail: "## Os 7 ossos\nTálus, Calcâneo, Navicular, Cuboide, Cuneiforme medial, intermédio e lateral.\n\nJunto com os metatarsos, formam os **arcos plantares** (longitudinal medial, lateral e transverso).",
    physiology: "Os ossos do tarso formam arcos elásticos que **absorvem impacto** e distribuem o peso durante a marcha, funcionando como amortecedores e alavancas. A queda do arco causa o **pé plano**.",
    bloodSupply: "Artérias dorsal do pé e plantares", venousDrainage: "Arcos venosos do pé",
    innervation: "Nervos plantares e fibular profundo", tags: ["tarso", "pé", "navicular", "cuboide", "cuneiforme", "arco plantar"],
  },
  {
    slug: "metatarsals", name: "Metatarsos", scientificName: "Ossa metatarsi",
    commonNames: ["metatarsos", "ossos do meio do pé"],
    category: "BONE", system: "SKELETAL", region: "LOWER_LIMB_FOOT", side: "BILATERAL",
    modelId: "metatarsals", difficulty: "BASIC",
    summary: "Os 5 metatarsos são os ossos longos do **antepé**, entre o tarso e as falanges. Sustentam o arco transverso e o peso na fase de impulsão da marcha.",
    anatomyDetail: "## Estrutura\nNumerados de I (hálux) a V (5º dedo), cada um com base, corpo e cabeça.\n\nA base do **5º metatarso** tem uma tuberosidade (inserção do fibular curto), local comum de fratura por avulsão.",
    physiology: "Suportam o peso na ponta do pé durante a marcha e a corrida. A cabeça do 1º metatarso é ponto-chave de apoio. Sobrecarga causa **metatarsalgia**; estresse repetitivo causa a fratura de marcha.",
    bloodSupply: "Artérias metatarsais (dorsal do pé)", venousDrainage: "Arco venoso dorsal",
    innervation: "Nervos plantares e fibular", tags: ["metatarsos", "pé", "antepé", "metatarsalgia", "marcha"],
  },
];

const PATHOLOGIES = [
  {
    structureSlug: "femur",
    name: "Fratura do Colo do Fêmur",
    icd10Code: "S72.0",
    description:
      "Fratura do colo femoral é uma emergência ortopédica comum em idosos osteoporóticos após trauma de baixa energia. Risco principal: necrose avascular da cabeça femoral.",
    symptoms: ["Dor inguinal aguda", "Encurtamento e rotação externa do membro", "Incapacidade de marcha"],
    treatment:
      "Cirurgia precoce (<48h). Parafusos canulados para fraturas sem deslocamento; artroplastia para fraturas deslocadas em idosos.",
    prognosis: "Mortalidade de 15-20% no 1º ano em idosos. Risco de necrose avascular de 10-45%.",
  },
  {
    structureSlug: "quadriceps-femoris",
    name: "Síndrome Fêmoro-Patelar",
    icd10Code: "M22.2",
    description:
      "Disfunção do tracking patelar por desequilíbrio entre VMO e vasto lateral, causando dor anterior do joelho. Causa mais comum de dor anterior do joelho em jovens.",
    symptoms: ["Dor anterior do joelho", "Piora ao subir/descer escadas", "Crepitação patelar"],
    treatment: "Fisioterapia (fortalecimento do VMO), bandagem patelar, AINES.",
    prognosis: "Favorável com tratamento conservador.",
  },
  {
    structureSlug: "humerus",
    name: "Fratura da Diáfise do Úmero",
    icd10Code: "S42.3",
    description:
      "Fratura do corpo do úmero, frequentemente associada à lesão do nervo radial que percorre o sulco radial. Pode resultar em 'mão caída'.",
    symptoms: ["Dor e deformidade no braço", "Mão caída (queda do punho)", "Perda de extensão do punho/dedos"],
    treatment: "Maioria conservadora (tala/órtese funcional de Sarmiento). Cirurgia se lesão neurovascular ou fratura instável.",
    prognosis: "Consolidação em ~90% dos casos. A lesão do radial geralmente é neuropraxia (recupera em semanas).",
  },
  {
    structureSlug: "heart",
    name: "Infarto Agudo do Miocárdio",
    icd10Code: "I21",
    description:
      "Necrose do músculo cardíaco por obstrução de uma artéria coronária (geralmente por trombo sobre placa aterosclerótica), levando à isquemia.",
    symptoms: ["Dor torácica opressiva", "Irradiação para braço esquerdo/mandíbula", "Sudorese", "Dispneia", "Náusea"],
    treatment: "Reperfusão urgente (angioplastia ou trombólise), antiagregantes, anticoagulação, MONABCH.",
    prognosis: "Depende do tempo até reperfusão ('tempo é músculo') e da extensão da área infartada.",
  },
  {
    structureSlug: "brain",
    name: "Acidente Vascular Cerebral (AVC)",
    icd10Code: "I64",
    description:
      "Déficit neurológico súbito por interrupção do fluxo sanguíneo cerebral. Pode ser isquêmico (~85%, obstrução) ou hemorrágico (~15%, ruptura).",
    symptoms: ["Hemiparesia súbita", "Desvio de rima labial", "Afasia", "Alteração visual", "Cefaleia intensa (hemorrágico)"],
    treatment: "AVC isquêmico: trombólise (<4,5h) ou trombectomia. Reconhecimento rápido (escala SAMU/FAST).",
    prognosis: "Janela terapêutica curta. Sequelas dependem da área e do tempo de isquemia.",
  },
  {
    structureSlug: "liver",
    name: "Cirrose Hepática",
    icd10Code: "K74.6",
    description:
      "Fibrose difusa e formação de nódulos regenerativos que distorcem a arquitetura hepática, resultado de agressão crônica (álcool, hepatites virais, esteatose).",
    symptoms: ["Ascite", "Icterícia", "Encefalopatia hepática", "Circulação colateral (cabeça de medusa)", "Aranhas vasculares"],
    treatment: "Tratar a causa, manejo das complicações (varizes, ascite); transplante em casos avançados.",
    prognosis: "Avaliado pelas escalas Child-Pugh e MELD. Irreversível, mas progressão pode ser retardada.",
  },
  {
    structureSlug: "lungs",
    name: "Pneumonia",
    icd10Code: "J18",
    description:
      "Infecção do parênquima pulmonar que preenche os alvéolos com exsudato inflamatório, prejudicando as trocas gasosas. Agente comum: Streptococcus pneumoniae.",
    symptoms: ["Tosse produtiva", "Febre e calafrios", "Dispneia", "Dor torácica pleurítica", "Estertores à ausculta"],
    treatment: "Antibioticoterapia conforme gravidade (CURB-65), suporte de oxigênio e hidratação.",
    prognosis: "Geralmente boa em jovens hígidos; reservada em idosos e imunossuprimidos.",
  },
  {
    structureSlug: "kidney",
    name: "Nefrolitíase (Cálculo Renal)",
    icd10Code: "N20.0",
    description:
      "Formação de cálculos no trato urinário a partir da cristalização de solutos (oxalato de cálcio é o mais comum). A 'pedra nos rins'.",
    symptoms: ["Cólica renal (dor lombar intensa em cólica)", "Irradiação para a virilha", "Hematúria", "Náuseas", "Disúria"],
    treatment: "Analgesia, hidratação, terapia expulsiva. Cálculos grandes: litotripsia ou ureteroscopia.",
    prognosis: "Cálculos <5 mm geralmente são eliminados espontaneamente. Alta taxa de recorrência.",
  },
];

const QUESTIONS = [
  {
    structureSlug: "femur",
    type: "MULTIPLE_CHOICE" as const,
    difficulty: "INTERMEDIATE" as const,
    level: "GRADUATION" as const,
    stem: "Qual artéria é a principal responsável pela vascularização da cabeça do fêmur no adulto?",
    options: JSON.stringify([
      { id: "a", text: "Artéria glútea superior", isCorrect: false, explanation: "Irriga o glúteo médio e mínimo." },
      { id: "b", text: "Artéria circunflexa femoral medial", isCorrect: true, explanation: "É a principal irrigação da cabeça femoral no adulto. Sua ruptura em fraturas do colo causa necrose avascular." },
      { id: "c", text: "Artéria obturadora", isCorrect: false, explanation: "Irriga apenas pequena porção via ligamento redondo (importante na criança)." },
      { id: "d", text: "Artéria femoral", isCorrect: false, explanation: "Não irriga diretamente a cabeça." },
      { id: "e", text: "Artéria circunflexa femoral lateral", isCorrect: false, explanation: "Irriga principalmente a região trocantérica anterior." },
    ]),
    correctAnswer: "b",
    explanation: "A artéria circunflexa femoral medial é a principal irrigação da cabeça femoral no adulto.",
    tags: ["fêmur", "vascularização", "necrose avascular", "ortopedia"],
  },
  {
    structureSlug: "femoral-nerve",
    type: "MULTIPLE_CHOICE" as const,
    difficulty: "ADVANCED" as const,
    level: "RESIDENCY" as const,
    stem: "Paciente com dor inguinal irradiada para face anterior da coxa, fraqueza na extensão do joelho e abolição do reflexo patelar. As raízes mais provavelmente comprometidas são:",
    context: "RM de coluna lombar revela hérnia discal foraminal direita.",
    options: JSON.stringify([
      { id: "a", text: "L1-L2", isCorrect: false, explanation: "Causariam déficit sensitivo na virilha, sem alterar o reflexo patelar." },
      { id: "b", text: "L2-L3", isCorrect: false, explanation: "Afetam flexão do quadril, mas o reflexo patelar é principalmente L4." },
      { id: "c", text: "L3-L4", isCorrect: true, explanation: "L3 (extensão do joelho) e L4 (reflexo patelar) compõem o nervo femoral. Explicam o quadro completo." },
      { id: "d", text: "L4-L5", isCorrect: false, explanation: "Afetam a dorsiflexão do pé." },
      { id: "e", text: "L5-S1", isCorrect: false, explanation: "Comprometem o nervo ciático." },
    ]),
    correctAnswer: "c",
    explanation: "O nervo femoral é formado por L2-L4, com L3 e L4 sendo cruciais para extensão do joelho e reflexo patelar.",
    tags: ["nervo femoral", "plexo lombar", "reflexo patelar", "neurologia"],
    year: 2023,
    source: "REVALIDA CFM",
  },
  {
    structureSlug: "humerus",
    type: "MULTIPLE_CHOICE" as const,
    difficulty: "INTERMEDIATE" as const,
    level: "GRADUATION" as const,
    stem: "Um paciente com fratura da diáfise do úmero apresenta 'mão caída' (incapacidade de estender o punho). Qual nervo foi lesado?",
    options: JSON.stringify([
      { id: "a", text: "Nervo mediano", isCorrect: false, explanation: "Lesão do mediano causa 'mão do pregador', não mão caída." },
      { id: "b", text: "Nervo ulnar", isCorrect: false, explanation: "Lesão do ulnar causa 'mão em garra'." },
      { id: "c", text: "Nervo radial", isCorrect: true, explanation: "O nervo radial percorre o sulco radial na diáfise do úmero. Sua lesão causa mão caída por paralisia dos extensores do punho/dedos." },
      { id: "d", text: "Nervo axilar", isCorrect: false, explanation: "Lesado em fraturas do colo cirúrgico; afeta o deltoide (abdução)." },
      { id: "e", text: "Nervo musculocutâneo", isCorrect: false, explanation: "Inerva flexores do braço (bíceps); afeta a flexão do cotovelo." },
    ]),
    correctAnswer: "c",
    explanation: "O nervo radial, no sulco radial, é o mais associado a fraturas da diáfise umeral, causando mão caída.",
    tags: ["úmero", "nervo radial", "mão caída", "ortopedia"],
  },
  {
    structureSlug: "heart",
    type: "MULTIPLE_CHOICE" as const,
    difficulty: "BASIC" as const,
    level: "GRADUATION" as const,
    stem: "Qual estrutura cardíaca é responsável por iniciar o impulso elétrico do coração, funcionando como marca-passo natural?",
    options: JSON.stringify([
      { id: "a", text: "Nó atrioventricular", isCorrect: false, explanation: "É a 'estação de retransmissão' que atrasa o impulso, mas não o inicia normalmente." },
      { id: "b", text: "Feixe de His", isCorrect: false, explanation: "Conduz o impulso aos ventrículos, não o gera." },
      { id: "c", text: "Nó sinoatrial", isCorrect: true, explanation: "O nó sinoatrial (SA), no átrio direito, é o marca-passo fisiológico, gerando 60-100 impulsos/min." },
      { id: "d", text: "Fibras de Purkinje", isCorrect: false, explanation: "Distribuem o impulso pelo miocárdio ventricular." },
      { id: "e", text: "Valva mitral", isCorrect: false, explanation: "Estrutura mecânica, sem função elétrica." },
    ]),
    correctAnswer: "c",
    explanation: "O nó sinoatrial é o marca-passo cardíaco natural, localizado no átrio direito.",
    tags: ["coração", "nó sinoatrial", "condução", "fisiologia cardíaca"],
  },
  {
    structureSlug: "kidney",
    type: "MULTIPLE_CHOICE" as const,
    difficulty: "INTERMEDIATE" as const,
    level: "GRADUATION" as const,
    stem: "Além da filtração do sangue, os rins têm função endócrina. Qual hormônio renal estimula a produção de hemácias?",
    options: JSON.stringify([
      { id: "a", text: "Renina", isCorrect: false, explanation: "Regula a pressão arterial via sistema renina-angiotensina, não a eritropoese." },
      { id: "b", text: "Eritropoetina", isCorrect: true, explanation: "A eritropoetina (EPO), produzida pelos rins, estimula a medula óssea a produzir hemácias. Sua deficiência causa anemia na doença renal crônica." },
      { id: "c", text: "Aldosterona", isCorrect: false, explanation: "É produzida pela suprarrenal (não pelo rim) e regula sódio/potássio." },
      { id: "d", text: "Insulina", isCorrect: false, explanation: "Produzida pelo pâncreas." },
      { id: "e", text: "Calcitonina", isCorrect: false, explanation: "Produzida pela tireoide, regula o cálcio." },
    ]),
    correctAnswer: "b",
    explanation: "A eritropoetina é produzida pelos rins e estimula a produção de hemácias na medula óssea.",
    tags: ["rim", "eritropoetina", "função endócrina", "anemia"],
  },
  {
    structureSlug: "lungs",
    type: "MULTIPLE_CHOICE" as const,
    difficulty: "BASIC" as const,
    level: "GRADUATION" as const,
    stem: "Sobre a anatomia dos pulmões, assinale a alternativa correta:",
    options: JSON.stringify([
      { id: "a", text: "O pulmão esquerdo possui 3 lobos", isCorrect: false, explanation: "É o direito que tem 3 lobos." },
      { id: "b", text: "O pulmão direito possui 2 lobos", isCorrect: false, explanation: "É o esquerdo que tem 2 lobos." },
      { id: "c", text: "O pulmão direito tem 3 lobos e o esquerdo 2 lobos", isCorrect: true, explanation: "Correto. O pulmão esquerdo tem apenas 2 lobos devido à incisura cardíaca, que abre espaço para o coração." },
      { id: "d", text: "Ambos os pulmões têm 3 lobos", isCorrect: false, explanation: "Apenas o direito tem 3." },
      { id: "e", text: "Ambos os pulmões têm 2 lobos", isCorrect: false, explanation: "Apenas o esquerdo tem 2." },
    ]),
    correctAnswer: "c",
    explanation: "O pulmão direito tem 3 lobos; o esquerdo tem 2 lobos e a incisura cardíaca.",
    tags: ["pulmão", "lobos", "anatomia", "respiratório"],
  },
];

async function main() {
  console.log("🌱 Seeding MEDATLAS database...");

  for (const s of [...STRUCTURES, ...EXTRA_BONES]) {
    const extra = CLINICAL_CONTENT[s.slug as string] ?? {};
    const data = {
      ...s,
      ...(extra.histology ? { histology: extra.histology } : {}),
      ...(extra.diagnosis ? { clinicalNotes: extra.diagnosis } : {}),
      ...(extra.surgery ? { surgicalNotes: extra.surgery } : {}),
    };
    await prisma.anatomicalStructure.upsert({
      where: { slug: s.slug },
      update: data,
      create: data,
    });
    console.log(`  ✓ Structure: ${s.name}`);
  }

  // Pathologies from the clinical content map (one per structure)
  for (const [slug, content] of Object.entries(CLINICAL_CONTENT)) {
    if (!content.pathology) continue;
    const structure = await prisma.anatomicalStructure.findUnique({ where: { slug } });
    if (!structure) continue;
    await prisma.structurePathology.deleteMany({
      where: { structureId: structure.id, name: content.pathology.name },
    });
    await prisma.structurePathology.create({
      data: { ...content.pathology, structureId: structure.id },
    });
  }
  console.log(`  ✓ Patologias clínicas adicionadas`);

  for (const p of PATHOLOGIES) {
    const structure = await prisma.anatomicalStructure.findUnique({
      where: { slug: p.structureSlug },
    });
    if (!structure) continue;
    const { structureSlug, ...pathData } = p;

    // Avoid duplicates: delete existing pathology with same name for this structure
    await prisma.structurePathology.deleteMany({
      where: { structureId: structure.id, name: p.name },
    });
    await prisma.structurePathology.create({
      data: { ...pathData, structureId: structure.id },
    });
    console.log(`  ✓ Pathology: ${p.name}`);
  }

  for (const q of QUESTIONS) {
    const structure = await prisma.anatomicalStructure.findUnique({
      where: { slug: q.structureSlug },
    });
    const { structureSlug, ...qData } = q;

    // Avoid duplicates: delete existing question with same stem
    await prisma.question.deleteMany({ where: { stem: q.stem } });
    await prisma.question.create({
      data: { ...qData, structureId: structure?.id },
    });
    console.log(`  ✓ Question: ${q.stem.slice(0, 40)}...`);
  }

  const achievements = [
    { slug: "first-structure", name: "Primeiro Passo", description: "Explorou a primeira estrutura anatômica", xpReward: 50, condition: { type: "structure_viewed", count: 1 } },
    { slug: "skeleton-complete", name: "Anatomista Ósseo", description: "Estudou todos os ossos do esqueleto", xpReward: 500, condition: { type: "system_complete", system: "SKELETAL" } },
    { slug: "streak-7", name: "Semana Consistente", description: "Estudou 7 dias consecutivos", xpReward: 300, condition: { type: "streak", days: 7 } },
    { slug: "quiz-100", name: "Centurião", description: "Respondeu 100 questões", xpReward: 200, condition: { type: "questions_answered", count: 100 } },
    { slug: "perfect-quiz", name: "Nota 10", description: "Quiz com 100% de acerto", xpReward: 150, condition: { type: "quiz_perfect" } },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { slug: ach.slug },
      update: ach,
      create: ach,
    });
  }
  console.log(`  ✓ ${achievements.length} achievements seeded`);

  const counts = {
    structures: await prisma.anatomicalStructure.count(),
    pathologies: await prisma.structurePathology.count(),
    questions: await prisma.question.count(),
  };
  console.log(`\n📊 Total no banco: ${counts.structures} estruturas, ${counts.pathologies} patologias, ${counts.questions} questões`);
  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
