// ================================================================
// MEDATLAS 3D — Conteúdo clínico por estrutura
// Histologia, Diagnóstico (clinicalNotes), Cirurgia (surgicalNotes)
// e uma Patologia principal por estrutura.
// ================================================================

export interface ClinicalContent {
  histology?: string;
  diagnosis?: string;
  surgery?: string;
  pathology?: {
    name: string;
    icd10Code?: string;
    description: string;
    symptoms: string[];
    treatment?: string;
    prognosis?: string;
  };
}

// ── Histologias compartilhadas por tipo de osso ───────────────────
const HISTO_LONG = `## Histologia — Osso Longo
- **Osso compacto (cortical)** na diáfise, organizado em **ósteons (sistemas de Havers)**: lamelas concêntricas ao redor de um canal central com vasos e nervos.
- **Osso esponjoso (trabecular)** nas epífises, com trabéculas e **medula óssea vermelha** (hematopoese na infância).
- **Células**: osteoblastos (produzem matriz), osteócitos (em lacunas, mantêm o osso) e osteoclastos (reabsorção).
- Revestido por **periósteo** (externo) e **endósteo** (interno). A **cavidade medular** contém medula amarela (gordura) no adulto.
- A placa epifisária (cartilagem hialina) é responsável pelo crescimento em comprimento até a fusão.`;

const HISTO_FLAT = `## Histologia — Osso Plano
- Apresenta **díploe**: uma camada de osso esponjoso entre duas lâminas de osso compacto.
- Matriz de **tecido ósseo lamelar** com osteócitos em lacunas.
- Rico em **medula óssea vermelha** hematopoética — locais clássicos de punção/biópsia de medula.
- Células: osteoblastos, osteócitos e osteoclastos; revestido por periósteo e endósteo.`;

const HISTO_SHORT = `## Histologia — Osso Curto
- Núcleo de **osso esponjoso (trabecular)** envolto por fina casca de **osso compacto**.
- Matriz lamelar com osteócitos em lacunas; medula óssea entre as trabéculas.
- Trabéculas orientadas segundo as linhas de força (trajetórias de tensão/compressão).
- Superfícies articulares recobertas por **cartilagem hialina**.`;

const HISTO_IRREGULAR = `## Histologia — Osso Irregular (vértebra)
- **Corpo de osso esponjoso** rico em medula vermelha, recoberto por fina camada de osso compacto.
- Matriz óssea lamelar com osteócitos; trabéculas alinhadas às forças de compressão axial.
- O **disco intervertebral** adjacente é **fibrocartilagem** (ânulo fibroso) com núcleo pulposo gelatinoso.`;

const BONE_DX = `## Diagnóstico por imagem
- **Radiografia (Raio-X)**: exame inicial para fraturas e alterações ósseas.
- **Tomografia (TC)**: detalha fraturas complexas e a arquitetura óssea.
- **Ressonância (RM)**: avalia medula óssea, partes moles e lesões ocultas.
- **Cintilografia óssea**: rastreia metástases, infecções e fraturas de estresse.`;

export const CLINICAL_CONTENT: Record<string, ClinicalContent> = {
  // ───────────── CRÂNIO E FACE ─────────────
  skull: {
    histology: HISTO_FLAT + `\n\nNo crânio, a díploe aloja medula vermelha e os **seios paranasais** são revestidos por epitélio respiratório.`,
    diagnosis: `## Diagnóstico
- **TC de crânio**: padrão-ouro no trauma (fraturas, hemorragias).
- **Raio-X de crânio**: uso limitado, avalia fraturas evidentes.
- **RM**: lesões encefálicas e de partes moles.
- Sinais de fratura de base: equimose periorbital ("olhos de guaxinim") e retroauricular (sinal de Battle).`,
    surgery: `## Procedimentos
- **Craniotomia / craniectomia descompressiva**: acesso ao encéfalo ou alívio de hipertensão intracraniana.
- **Cranioplastia**: reconstrução de defeitos ósseos.
- Fixação de fraturas com placas e parafusos de titânio.`,
    pathology: { name: "Fratura de Crânio", icd10Code: "S02", description: "Quebra de um ou mais ossos do crânio, geralmente por trauma. Pode ser linear, com afundamento ou de base, com risco de lesão encefálica e hemorragia.", symptoms: ["Cefaleia intensa", "Perda de consciência", "Otorragia/rinorragia de LCR", "Equimose periorbital ou retroauricular"], treatment: "Observação nas lineares; cirurgia (elevação/descompressão) nas com afundamento ou hematoma associado.", prognosis: "Depende da lesão encefálica subjacente, não apenas da fratura." },
  },
  mandible: {
    histology: HISTO_FLAT + `\n\nAloja os **alvéolos dentários**; os dentes fixam-se por ligamento periodontal (gonfose).`,
    diagnosis: `## Diagnóstico
- **Radiografia panorâmica (ortopantomografia)**: visão geral de mandíbula e dentes.
- **TC**: fraturas complexas e da ATM.
- Avaliação da oclusão dentária e da abertura bucal.`,
    surgery: `## Procedimentos
- **Redução e fixação interna (placas/parafusos)** das fraturas mandibulares.
- **Bloqueio maxilomandibular** (fixação intermaxilar).
- Cirurgia ortognática para correção de deformidades.`,
    pathology: { name: "Fratura de Mandíbula", icd10Code: "S02.6", description: "Fratura comum no trauma facial, frequentemente em múltiplos pontos (a mandíbula forma um anel). Locais comuns: côndilo, ângulo e corpo.", symptoms: ["Má oclusão dentária", "Dor e edema", "Trismo (dificuldade de abrir a boca)", "Alteração da sensibilidade do lábio inferior"], treatment: "Fixação maxilomandibular e/ou placas. Antibioticoterapia se exposta na boca.", prognosis: "Boa consolidação com tratamento adequado." },
  },
  hyoid: {
    histology: HISTO_SHORT + `\n\nServe de ancoragem a músculos e ao ligamento estilo-hióideo.`,
    diagnosis: `## Diagnóstico
- **TC de pescoço**: avalia fraturas (raras, importantes na medicina legal — estrangulamento).
- Palpação cuidadosa; dor à deglutição sugere lesão.`,
    surgery: `## Procedimentos
- Raramente operado. Fraturas com obstrução de via aérea podem exigir traqueostomia e fixação.
- Suspensão hióidea em cirurgias da apneia do sono.`,
    pathology: { name: "Fratura do Hioide", icd10Code: "S12.8", description: "Fratura rara, classicamente associada a estrangulamento ou trauma cervical direto. Tem relevância médico-legal.", symptoms: ["Dor à deglutição (odinofagia)", "Disfonia", "Crepitação cervical", "Equimose no pescoço"], treatment: "Conservador na maioria; via aérea protegida se houver edema/obstrução.", prognosis: "Boa, exceto se houver comprometimento de via aérea." },
  },

  // ───────────── COLUNA VERTEBRAL ─────────────
  "cervical-vertebrae": {
    histology: HISTO_IRREGULAR,
    diagnosis: `## Diagnóstico
- **TC de coluna cervical**: padrão no trauma (protocolo do politraumatizado).
- **RM**: avalia medula espinhal, discos e ligamentos.
- Raio-X em flexão/extensão para instabilidade.`,
    surgery: `## Procedimentos
- **Artrodese cervical (fusão)** anterior ou posterior.
- **Discectomia** e descompressão.
- Fixação com placas/parafusos no trauma instável.`,
    pathology: { name: "Hérnia de Disco Cervical", icd10Code: "M50", description: "Protrusão do disco intervertebral cervical comprimindo raízes nervosas ou a medula, causando cervicobraquialgia.", symptoms: ["Dor cervical irradiada para o braço", "Parestesias nos dedos", "Fraqueza muscular", "Redução de reflexos"], treatment: "Conservador (analgesia, fisioterapia); cirurgia (discectomia) se déficit progressivo.", prognosis: "Boa na maioria dos casos com tratamento conservador." },
  },
  "thoracic-vertebrae": {
    histology: HISTO_IRREGULAR,
    diagnosis: `## Diagnóstico
- **Raio-X e TC** para fraturas (compressão por osteoporose é comum).
- **RM**: avalia medula e processos infecciosos/tumorais.
- Densitometria óssea para risco de fratura osteoporótica.`,
    surgery: `## Procedimentos
- **Vertebroplastia / cifoplastia**: cimento ósseo em fraturas por compressão.
- Artrodese e fixação no trauma instável.`,
    pathology: { name: "Fratura Vertebral por Compressão", icd10Code: "M80", description: "Colapso do corpo vertebral, frequentemente por osteoporose em idosos, levando a dor e cifose progressiva.", symptoms: ["Dor dorsal aguda", "Perda de altura", "Hipercifose (corcunda)", "Dor à percussão"], treatment: "Analgesia, tratamento da osteoporose, cifoplastia em casos selecionados.", prognosis: "Risco aumentado de novas fraturas; manejo da osteoporose é essencial." },
  },
  "lumbar-vertebrae": {
    histology: HISTO_IRREGULAR,
    diagnosis: `## Diagnóstico
- **RM de coluna lombar**: exame de escolha para hérnias e compressão radicular.
- TC para detalhe ósseo; Raio-X dinâmico para instabilidade.
- Testes: Lasègue (elevação da perna estendida).`,
    surgery: `## Procedimentos
- **Microdiscectomia** para hérnias com déficit.
- **Laminectomia descompressiva** na estenose.
- Artrodese lombar na instabilidade/espondilolistese.`,
    pathology: { name: "Hérnia de Disco Lombar", icd10Code: "M51", description: "Protrusão do núcleo pulposo comprimindo raízes nervosas (mais comum em L4-L5 e L5-S1), causando lombociatalgia.", symptoms: ["Lombalgia irradiada para a perna (ciática)", "Parestesia", "Fraqueza do pé", "Lasègue positivo"], treatment: "Conservador (90% melhoram); cirurgia se déficit neurológico ou dor refratária.", prognosis: "Favorável; síndrome da cauda equina é emergência cirúrgica." },
  },
  sacrum: {
    histology: HISTO_IRREGULAR.replace("(vértebra)", "(sacro)"),
    diagnosis: `## Diagnóstico
- **TC de pelve**: melhor para fraturas sacrais.
- **RM**: fraturas de insuficiência, tumores e infecções.
- Cintilografia em fraturas de estresse.`,
    surgery: `## Procedimentos
- Fixação sacroilíaca percutânea no trauma de anel pélvico.
- Sacroplastia (cimento) em fraturas de insuficiência.`,
    pathology: { name: "Fratura do Sacro", icd10Code: "S32.1", description: "Frequente em traumas de alta energia (com fratura do anel pélvico) ou de insuficiência em idosos osteoporóticos.", symptoms: ["Dor lombossacral", "Dor à carga", "Déficit neurológico (raízes sacrais)", "Disfunção vesical/intestinal"], treatment: "Conservador nas estáveis; fixação nas instáveis ou com lesão neural.", prognosis: "Boa nas estáveis; depende da lesão neurológica associada." },
  },
  coccyx: {
    histology: HISTO_SHORT,
    diagnosis: `## Diagnóstico
- **Raio-X de cóccix** (incidências específicas).
- Avaliação clínica/toque retal para mobilidade dolorosa.`,
    surgery: `## Procedimentos
- **Coccigectomia** (remoção) reservada a coccidínia refratária.
- Infiltrações com corticoide/anestésico.`,
    pathology: { name: "Coccidínia", icd10Code: "M53.3", description: "Dor crônica na região do cóccix, frequentemente após queda ou parto, agravada ao sentar.", symptoms: ["Dor ao sentar", "Dor à pressão local", "Piora ao levantar-se", "Desconforto na evacuação"], treatment: "Almofada em forma de rosca, AINEs, fisioterapia, infiltrações; coccigectomia em casos extremos.", prognosis: "Maioria melhora com tratamento conservador." },
  },

  // ───────────── TÓRAX ─────────────
  sternum: {
    histology: HISTO_FLAT,
    diagnosis: `## Diagnóstico
- **TC de tórax**: melhor para fraturas esternais.
- Raio-X em perfil; ECG/troponina (associação com contusão miocárdica).`,
    surgery: `## Procedimentos
- **Esternotomia mediana**: principal acesso à cirurgia cardíaca.
- Fixação esternal com placas em fraturas instáveis.`,
    pathology: { name: "Fratura de Esterno", icd10Code: "S22.2", description: "Comum em trauma direto (cinto de segurança, volante). Importante por associação com lesão cardíaca/pulmonar.", symptoms: ["Dor torácica anterior", "Dor à respiração", "Equimose", "Crepitação local"], treatment: "Analgesia e observação; investigar contusão miocárdica; fixação se instável.", prognosis: "Boa, desde que afastadas lesões intratorácicas." },
  },
  ribs: {
    histology: HISTO_FLAT,
    diagnosis: `## Diagnóstico
- **Raio-X de tórax** (pode não mostrar fraturas; busca pneumotórax/hemotórax).
- **TC**: mais sensível para fraturas e complicações.
- Atenção ao **tórax instável** (flail chest).`,
    surgery: `## Procedimentos
- Geralmente conservador (analgesia).
- **Fixação costal** em tórax instável ou múltiplas fraturas.
- Drenagem torácica se pneumo/hemotórax.`,
    pathology: { name: "Fratura de Costela", icd10Code: "S22.3", description: "Lesão torácica muito comum. Múltiplas fraturas podem gerar tórax instável; risco de pneumotórax e contusão pulmonar.", symptoms: ["Dor torácica ventilatório-dependente", "Crepitação", "Respiração superficial", "Dispneia"], treatment: "Analgesia eficaz, fisioterapia respiratória; tratar complicações pleurais.", prognosis: "Boa; consolidação em 4-6 semanas. Idosos têm maior risco de pneumonia." },
  },

  // ───────────── MEMBRO SUPERIOR ─────────────
  clavicle: {
    histology: HISTO_LONG + `\n\n*Curiosidade:* é o **primeiro osso a ossificar** (ossificação intramembranosa e endocondral).`,
    diagnosis: `## Diagnóstico
- **Raio-X de clavícula**: confirma e classifica a fratura (terço médio é o mais comum).
- TC em fraturas mediais (relação com mediastino).`,
    surgery: `## Procedimentos
- Maioria **conservadora** (tipoia).
- **Placa ou haste intramedular** se desviada, encurtada ou exposta.`,
    pathology: { name: "Fratura de Clavícula", icd10Code: "S42.0", description: "Fratura muito comum (queda sobre o ombro). O terço médio é o local mais frequente.", symptoms: ["Dor e deformidade na clavícula", "Ombro caído", "Crepitação", "Dificuldade de elevar o braço"], treatment: "Tipoia na maioria; cirurgia se grande desvio, encurtamento ou lesão neurovascular.", prognosis: "Excelente; consolidação em 6-8 semanas." },
  },
  scapula: {
    histology: HISTO_FLAT,
    diagnosis: `## Diagnóstico
- **TC com reconstrução 3D**: melhor para fraturas da glenoide.
- Raio-X (incidências específicas do ombro).
- Fratura de escápula indica trauma de alta energia (buscar lesões associadas).`,
    surgery: `## Procedimentos
- Maioria **conservadora**.
- Fixação se a fratura envolver a glenoide com instabilidade articular.`,
    pathology: { name: "Fratura de Escápula", icd10Code: "S42.1", description: "Rara, indica trauma de alta energia. Frequentemente associada a lesões torácicas graves.", symptoms: ["Dor no ombro/dorso", "Braço aduzido e imóvel", "Edema", "Dor à mobilização do ombro"], treatment: "Conservador na maioria; cirurgia em fraturas articulares desviadas.", prognosis: "Bom para o osso; depende das lesões associadas." },
  },
  humerus: {
    histology: HISTO_LONG,
    diagnosis: `## Diagnóstico
- **Raio-X do braço** (frente e perfil).
- TC nas fraturas articulares (proximal/distal).
- **Avaliar sempre o nervo radial** (extensão do punho) nas fraturas de diáfise.`,
    surgery: `## Procedimentos
- **Conservador** (órtese de Sarmiento) na maioria das diáfises.
- **Placa ou haste intramedular**; fraturas proximais podem exigir prótese.`,
    pathology: { name: "Fratura do Colo Cirúrgico do Úmero", icd10Code: "S42.2", description: "Comum em idosos (queda). Importante pela proximidade com o nervo axilar.", symptoms: ["Dor no ombro", "Incapacidade de abduzir o braço", "Equimose no braço", "Perda de sensibilidade na região do deltoide"], treatment: "Tipoia e reabilitação; cirurgia/prótese se cominutiva ou desviada.", prognosis: "Boa funcional na maioria." },
  },
  radius: {
    histology: HISTO_LONG,
    diagnosis: `## Diagnóstico
- **Raio-X de punho/antebraço**: diagnóstico da fratura de Colles.
- TC nas fraturas articulares distais.`,
    surgery: `## Procedimentos
- **Redução incruenta e gesso** nas estáveis.
- **Placa volar** nas fraturas distais instáveis (padrão atual).`,
    pathology: { name: "Fratura de Colles", icd10Code: "S52.5", description: "Fratura da extremidade distal do rádio com desvio dorsal ('dorso de garfo'). Muito comum em quedas com a mão espalmada.", symptoms: ["Dor e deformidade do punho", "Edema", "Deformidade em 'dorso de garfo'", "Limitação de movimento"], treatment: "Redução e imobilização; placa volar se instável.", prognosis: "Boa; rigidez residual possível em idosos." },
  },
  ulna: {
    histology: HISTO_LONG,
    diagnosis: `## Diagnóstico
- **Raio-X de antebraço/cotovelo**: sempre incluir as articulações (descartar Monteggia).
- Avaliar o nervo ulnar.`,
    surgery: `## Procedimentos
- **Placa de compressão** na diáfise.
- Fixação do olécrano com banda de tensão.`,
    pathology: { name: "Fratura do Olécrano", icd10Code: "S52.0", description: "Fratura da proeminência do cotovelo, geralmente por trauma direto ou tração do tríceps. Afeta a extensão do cotovelo.", symptoms: ["Dor no cotovelo", "Incapacidade de estender o cotovelo", "Edema posterior", "Defeito palpável"], treatment: "Conservador se sem desvio; banda de tensão/placa se desviada.", prognosis: "Boa com restauração da extensão." },
  },
  carpals: {
    histology: HISTO_SHORT,
    diagnosis: `## Diagnóstico
- **Raio-X com incidência específica do escafoide**.
- **RM ou TC**: fratura de escafoide oculta (alta suspeita clínica).
- Dor na tabaqueira anatômica sugere fratura de escafoide.`,
    surgery: `## Procedimentos
- Imobilização prolongada (escafoide).
- **Fixação com parafuso de Herbert** em fraturas desviadas ou pseudoartrose.`,
    pathology: { name: "Fratura do Escafoide", icd10Code: "S62.0", description: "Fratura do carpo mais comum. Risco de necrose avascular pela irrigação retrógrada (polo proximal).", symptoms: ["Dor na tabaqueira anatômica", "Edema do punho", "Dor à preensão", "Limitação do movimento"], treatment: "Imobilização; fixação cirúrgica se desviada. Alto índice de suspeita mesmo com Raio-X normal.", prognosis: "Risco de pseudoartrose e necrose avascular se não tratada." },
  },
  metacarpals: {
    histology: HISTO_LONG,
    diagnosis: `## Diagnóstico
- **Raio-X da mão**: confirma fraturas (cabeça do 5º = fratura do boxeador).
- Avaliar rotação/deformidade dos dedos.`,
    surgery: `## Procedimentos
- Conservador (calha) na maioria.
- Fixação com fios/placa se angulação ou rotação importantes.`,
    pathology: { name: "Fratura do Boxeador", icd10Code: "S62.3", description: "Fratura do colo do 5º metacarpo, típica de soco com punho fechado.", symptoms: ["Dor no dorso da mão", "Edema", "Perda da proeminência do nó do dedo", "Dor ao fechar a mão"], treatment: "Redução e imobilização; cirurgia se grande angulação ou rotação.", prognosis: "Boa funcional na maioria." },
  },
  phalanges: {
    histology: HISTO_LONG,
    diagnosis: `## Diagnóstico
- **Raio-X do dedo** (frente e perfil).
- Avaliar lesões tendíneas e do leito ungueal associadas.`,
    surgery: `## Procedimentos
- Imobilização (sindactilia ou tala).
- Fixação com fios de Kirschner em fraturas instáveis ou articulares.`,
    pathology: { name: "Fratura de Falange", icd10Code: "S62.6", description: "Fraturas muito comuns dos dedos, por esmagamento ou trauma direto. Podem afetar a função fina da mão.", symptoms: ["Dor e edema do dedo", "Deformidade", "Hematoma subungueal", "Limitação de movimento"], treatment: "Imobilização; redução e fixação se desviada/articular.", prognosis: "Boa; rigidez é a principal sequela." },
  },

  // ───────────── PELVE E MEMBRO INFERIOR ─────────────
  pelvis: {
    histology: HISTO_FLAT,
    diagnosis: `## Diagnóstico
- **Raio-X de bacia** (AP) no trauma.
- **TC de pelve**: padrão para fraturas do anel pélvico.
- Atenção a hemorragia retroperitoneal (instabilidade hemodinâmica).`,
    surgery: `## Procedimentos
- **Fixador externo** na estabilização de emergência.
- Fixação interna do anel pélvico/acetábulo.
- Cinta pélvica no atendimento pré-hospitalar.`,
    pathology: { name: "Fratura de Anel Pélvico", icd10Code: "S32.8", description: "Trauma de alta energia que pode romper o anel pélvico em múltiplos pontos, com risco de hemorragia maciça.", symptoms: ["Dor pélvica intensa", "Instabilidade à compressão", "Discrepância de membros", "Choque hemorrágico"], treatment: "Cinta/fixador na emergência; controle de hemorragia; fixação definitiva.", prognosis: "Mortalidade elevada nas instáveis com sangramento." },
  },
  patella: {
    histology: HISTO_SHORT + `\n\nÉ o **maior osso sesamoide**, com a face articular posterior recoberta pela cartilagem mais espessa do corpo.`,
    diagnosis: `## Diagnóstico
- **Raio-X do joelho** (incluindo axial de patela).
- Avaliar o mecanismo extensor (capacidade de estender o joelho).`,
    surgery: `## Procedimentos
- **Banda de tensão** ou parafusos nas fraturas transversas.
- Patelectomia parcial em fraturas cominutivas do polo.`,
    pathology: { name: "Fratura de Patela", icd10Code: "S82.0", description: "Quebra da patela por trauma direto ou contração violenta do quadríceps; compromete a extensão do joelho.", symptoms: ["Dor anterior do joelho", "Incapacidade de estender a perna", "Defeito palpável", "Hemartrose"], treatment: "Conservador se sem desvio e mecanismo extensor íntegro; cirurgia se desviada.", prognosis: "Boa com restauração do mecanismo extensor." },
  },
  femur: {
    histology: HISTO_LONG,
    diagnosis: `## Diagnóstico
- **Raio-X de quadril/fêmur**: padrão inicial.
- **RM**: fraturas ocultas do colo femoral.
- Avaliar encurtamento e rotação externa do membro.`,
    surgery: `## Procedimentos
- **Haste intramedular** nas fraturas de diáfise.
- **Artroplastia (prótese)** nas fraturas do colo em idosos.
- Parafusos canulados nas fraturas sem desvio.`,
    pathology: { name: "Fratura Diafisária do Fêmur", icd10Code: "S72.3", description: "Trauma de alta energia em jovens; pode causar grande perda sanguínea no compartimento da coxa.", symptoms: ["Dor intensa na coxa", "Deformidade e encurtamento", "Incapacidade de marcha", "Edema volumoso"], treatment: "Haste intramedular é o padrão-ouro.", prognosis: "Boa com fixação adequada." },
  },
  tibia: {
    histology: HISTO_LONG,
    diagnosis: `## Diagnóstico
- **Raio-X de perna** (frente e perfil).
- TC nas fraturas do platô tibial e do pilão.
- **Atenção à síndrome compartimental** (dor desproporcional).`,
    surgery: `## Procedimentos
- **Haste intramedular** na diáfise.
- Placa nas fraturas do platô; fixador externo nas expostas.`,
    pathology: { name: "Fratura Exposta da Tíbia", icd10Code: "S82.2", description: "Comum por ser subcutânea. As expostas têm alto risco de infecção e exigem manejo urgente.", symptoms: ["Dor e deformidade na perna", "Ferida com exposição óssea", "Incapacidade de apoiar", "Risco de síndrome compartimental"], treatment: "Limpeza cirúrgica precoce, antibióticos, estabilização (haste/fixador).", prognosis: "Depende do grau de exposição e contaminação." },
  },
  fibula: {
    histology: HISTO_LONG,
    diagnosis: `## Diagnóstico
- **Raio-X de tornozelo/perna**.
- Avaliar a estabilidade do tornozelo (sindesmose) e o nervo fibular comum.`,
    surgery: `## Procedimentos
- Conservador nas isoladas estáveis.
- **Placa lateral** nas fraturas do maléolo lateral com instabilidade do tornozelo.
- A fíbula é doadora frequente em **enxertos ósseos vascularizados**.`,
    pathology: { name: "Fratura de Tornozelo (Maléolo Lateral)", icd10Code: "S82.6", description: "Fratura do maléolo lateral (fíbula distal), comum em entorses graves do tornozelo.", symptoms: ["Dor e edema lateral do tornozelo", "Equimose", "Incapacidade de apoiar", "Instabilidade"], treatment: "Imobilização se estável; fixação com placa se a articulação estiver instável.", prognosis: "Boa quando a congruência do tornozelo é restaurada." },
  },
  calcaneus: {
    histology: HISTO_SHORT,
    diagnosis: `## Diagnóstico
- **Raio-X** com **ângulo de Böhler** (reduzido nas fraturas).
- **TC**: padrão para fraturas articulares do calcâneo.
- Quedas de altura: investigar fratura de coluna associada.`,
    surgery: `## Procedimentos
- Conservador nas extra-articulares.
- **Redução e fixação com placa** nas articulares desviadas.`,
    pathology: { name: "Fratura do Calcâneo", icd10Code: "S92.0", description: "Geralmente por queda de altura (apoio nos pés). Frequentemente articular e de difícil tratamento.", symptoms: ["Dor intensa no calcanhar", "Edema e equimose plantar", "Incapacidade de apoiar", "Alargamento do calcanhar"], treatment: "Conservador ou fixação cirúrgica conforme a articulação subtalar.", prognosis: "Artrose subtalar é sequela comum." },
  },
  talus: {
    histology: HISTO_SHORT + `\n\nGrande parte é revestida por cartilagem articular, com **irrigação precária** (risco de necrose).`,
    diagnosis: `## Diagnóstico
- **TC do tornozelo/pé**: detalha a fratura.
- **RM**: avalia necrose avascular (sinal de Hawkins ao Raio-X é bom prognóstico).`,
    surgery: `## Procedimentos
- **Redução anatômica e fixação** urgente (preservar a vascularização).
- Artrodese em casos de necrose/colapso.`,
    pathology: { name: "Fratura do Colo do Tálus", icd10Code: "S92.1", description: "Fratura grave com alto risco de necrose avascular devido à irrigação tênue do tálus.", symptoms: ["Dor intensa no tornozelo", "Edema importante", "Deformidade", "Incapacidade de apoiar"], treatment: "Redução anatômica e fixação precoce.", prognosis: "Risco elevado de necrose avascular e artrose." },
  },
  tarsals: {
    histology: HISTO_SHORT,
    diagnosis: `## Diagnóstico
- **Raio-X do pé** com incidências oblíquas.
- **TC**: lesões de Lisfranc e fraturas ocultas do mediopé.`,
    surgery: `## Procedimentos
- Conservador na maioria.
- Fixação/artrodese nas luxofraturas de Lisfranc.`,
    pathology: { name: "Lesão de Lisfranc", icd10Code: "S93.3", description: "Luxofratura da articulação tarsometatársica, frequentemente subdiagnosticada; pode levar a deformidade e artrose.", symptoms: ["Dor no mediopé", "Edema e equimose plantar", "Incapacidade de apoiar", "Dor à pronação/abdução"], treatment: "Fixação cirúrgica na maioria das instáveis.", prognosis: "Artrose se não tratada adequadamente." },
  },
  metatarsals: {
    histology: HISTO_LONG,
    diagnosis: `## Diagnóstico
- **Raio-X do pé**.
- Cintilografia/RM nas **fraturas de estresse** (Raio-X inicial normal).`,
    surgery: `## Procedimentos
- Conservador na maioria (bota/sapato rígido).
- Fixação na fratura da base do 5º metatarso (Jones) com má consolidação.`,
    pathology: { name: "Fratura de Estresse do Metatarso", icd10Code: "M84.3", description: "Fratura por sobrecarga repetitiva (marcha/corrida), comum no 2º e 3º metatarsos ('fratura de marcha').", symptoms: ["Dor no antepé que piora com atividade", "Edema localizado", "Dor à palpação", "Alívio com repouso"], treatment: "Repouso relativo, calçado rígido; raramente cirurgia.", prognosis: "Excelente com repouso adequado." },
  },

  // ───────────── ÓRGÃOS ─────────────
  heart: {
    histology: `## Histologia
- **Miocárdio**: músculo estriado cardíaco com **discos intercalares** (junções comunicantes que sincronizam a contração) e células ramificadas mononucleadas.
- **Endocárdio** (endotélio interno) e **epicárdio** (mesotélio externo).
- Células marca-passo do nó sinoatrial geram o automatismo.`,
    diagnosis: `## Diagnóstico
- **ECG**: ritmo e isquemia.
- **Ecocardiograma**: função e válvulas.
- **Troponina**: lesão miocárdica.
- Cateterismo/angiotomografia das coronárias.`,
    surgery: `## Procedimentos
- **Revascularização (ponte de safena/mamária)**.
- **Angioplastia com stent**.
- Troca valvar, transplante cardíaco.`,
    pathology: { name: "Insuficiência Cardíaca", icd10Code: "I50", description: "Incapacidade do coração de bombear sangue suficiente para as demandas do corpo, por disfunção sistólica ou diastólica.", symptoms: ["Dispneia aos esforços", "Edema de membros inferiores", "Fadiga", "Ortopneia"], treatment: "IECA/BRA, betabloqueadores, diuréticos, restrição de sódio.", prognosis: "Crônica e progressiva; manejo melhora sobrevida e qualidade de vida." },
  },
  lungs: {
    histology: `## Histologia
- **Alvéolos** revestidos por **pneumócitos tipo I** (trocas gasosas) e **tipo II** (produzem surfactante).
- Vias aéreas com **epitélio respiratório ciliado** pseudoestratificado e células caliciformes.
- Barreira alvéolo-capilar finíssima para difusão de gases.`,
    diagnosis: `## Diagnóstico
- **Raio-X e TC de tórax**.
- **Espirometria**: função pulmonar.
- Gasometria arterial; broncoscopia.`,
    surgery: `## Procedimentos
- **Lobectomia / pneumonectomia** (câncer).
- Drenagem torácica; toracoscopia (VATS).
- Transplante pulmonar.`,
    pathology: { name: "Doença Pulmonar Obstrutiva Crônica (DPOC)", icd10Code: "J44", description: "Limitação crônica do fluxo aéreo, geralmente por tabagismo, com bronquite crônica e/ou enfisema.", symptoms: ["Dispneia progressiva", "Tosse crônica", "Expectoração", "Sibilância"], treatment: "Cessação do tabagismo, broncodilatadores, oxigenoterapia.", prognosis: "Progressiva; cessar de fumar é o que mais altera o curso." },
  },
  liver: {
    histology: `## Histologia
- Organizado em **lóbulos hepáticos** hexagonais, com **hepatócitos** dispostos em cordões ao redor da veia centrolobular.
- **Sinusoides** (capilares fenestrados) com **células de Kupffer** (macrófagos).
- **Espaço porta**: ramo da artéria hepática, veia porta e ducto biliar (tríade portal).`,
    diagnosis: `## Diagnóstico
- **Provas hepáticas** (AST, ALT, bilirrubinas, albumina, TAP).
- **Ultrassom/TC/RM** de abdome.
- Elastografia (fibrose); biópsia hepática.`,
    surgery: `## Procedimentos
- **Hepatectomia** (ressecção de tumores).
- Transplante hepático.
- Derivações para hipertensão portal (TIPS).`,
    pathology: { name: "Hepatite Viral", icd10Code: "B19", description: "Inflamação do fígado por vírus (A, B, C, D, E). As formas B e C podem cronificar e evoluir para cirrose/câncer.", symptoms: ["Icterícia", "Fadiga", "Náuseas", "Dor no hipocôndrio direito", "Colúria"], treatment: "Suporte nas agudas; antivirais nas crônicas (B e C). Vacinação (A e B).", prognosis: "Variável; hepatites B e C crônicas exigem acompanhamento." },
  },
  brain: {
    histology: `## Histologia
- **Substância cinzenta** (corpos de neurônios) e **branca** (axônios mielinizados).
- **Neurônios** e células da **glia** (astrócitos, oligodendrócitos, micróglia, ependimárias).
- **Barreira hematoencefálica** formada por capilares contínuos e pés astrocitários.`,
    diagnosis: `## Diagnóstico
- **TC de crânio**: rápida no AVC/trauma.
- **RM de encéfalo**: detalhe de lesões.
- EEG; punção lombar (LCR); angiografia.`,
    surgery: `## Procedimentos
- **Craniotomia** para tumores/hematomas.
- Clipagem/embolização de aneurismas.
- Derivação ventricular (hidrocefalia).`,
    pathology: { name: "Aneurisma Cerebral", icd10Code: "I67.1", description: "Dilatação anormal de uma artéria cerebral, com risco de ruptura e hemorragia subaracnóidea grave.", symptoms: ["Cefaleia súbita e intensa ('a pior da vida')", "Rigidez de nuca", "Náuseas/vômitos", "Alteração da consciência"], treatment: "Clipagem cirúrgica ou embolização endovascular.", prognosis: "Ruptura tem alta morbimortalidade; tratamento precoce melhora desfecho." },
  },
  stomach: {
    histology: `## Histologia
- Mucosa com **fossetas e glândulas gástricas**: células **parietais** (HCl e fator intrínseco), **principais** (pepsinogênio), mucosas e enteroendócrinas (gastrina).
- Epitélio colunar simples secretor de muco protetor.
- Três camadas musculares (oblíqua, circular, longitudinal).`,
    diagnosis: `## Diagnóstico
- **Endoscopia digestiva alta** com biópsia (padrão-ouro).
- Pesquisa de **H. pylori**.
- Seriografia esôfago-estômago-duodeno.`,
    surgery: `## Procedimentos
- **Gastrectomia** (parcial/total) no câncer.
- Cirurgia bariátrica (gastroplastia/bypass).
- Sutura de úlcera perfurada.`,
    pathology: { name: "Úlcera Péptica", icd10Code: "K27", description: "Lesão na mucosa gástrica/duodenal por desequilíbrio entre ácido e proteção, associada a H. pylori e AINEs.", symptoms: ["Dor epigástrica em queimação", "Relação com alimentação", "Náuseas", "Melena (se sangrar)"], treatment: "Inibidores de bomba de prótons, erradicação do H. pylori, suspensão de AINEs.", prognosis: "Boa com tratamento; complicações: sangramento e perfuração." },
  },
  kidney: {
    histology: `## Histologia
- Unidade funcional: **néfron** (corpúsculo renal + túbulos).
- **Glomérulo**: rede de capilares para filtração, com podócitos.
- Túbulos contorcidos proximal/distal e alça de Henle realizam reabsorção/secreção.`,
    diagnosis: `## Diagnóstico
- **Creatinina e ureia**; cálculo da **TFG**.
- **Urina tipo I** e ultrassom renal.
- TC para cálculos; biópsia renal em nefropatias.`,
    surgery: `## Procedimentos
- **Nefrectomia** (tumor/doador).
- **Litotripsia / ureteroscopia** para cálculos.
- Transplante renal.`,
    pathology: { name: "Doença Renal Crônica", icd10Code: "N18", description: "Perda progressiva e irreversível da função renal, comumente por diabetes e hipertensão.", symptoms: ["Edema", "Hipertensão", "Fadiga", "Redução do volume urinário", "Anemia"], treatment: "Controle de pressão e glicemia, dieta; diálise ou transplante na fase terminal.", prognosis: "Progressiva; controle dos fatores retarda a evolução." },
  },
};
