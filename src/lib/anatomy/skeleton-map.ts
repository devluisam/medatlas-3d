/**
 * Mapeamento entre os nós do modelo public/models/skeleton.glb e as estruturas
 * do banco (pelo slug).
 *
 * O modelo ("Human Skeleton", Terrie/Sketchfab, CC-BY-4.0) tem 183 malhas com
 * nomes anatômicos em inglês, às vezes com lado (`l_femur`, `r_rib7`, `l cuboid`)
 * e vértebras numeradas (`c1`, `t12`, `l5`). Cada malha vira uma *peça* com nome
 * em português, e várias peças pertencem a uma *estrutura* do atlas (ex.: as 24
 * costelas → `ribs`). O teste tests/unit/skeleton-map.test.ts lê o GLB e garante
 * que toda malha é reconhecida e que todo slug existe no seed.
 */

export type BodySideKey = "left" | "right";

export interface MeshPart {
  /** slug da estrutura no banco; null = peça visível sem ficha no atlas */
  slug: string | null;
  /** nome da peça em português, sem o lado */
  part: string;
  side: BodySideKey | null;
}

/** Estruturas do atlas que têm malha neste modelo. */
export const MODEL_STRUCTURE_SLUGS = [
  "skull",
  "mandible",
  "hyoid",
  "cervical-vertebrae",
  "thoracic-vertebrae",
  "lumbar-vertebrae",
  "sacrum",
  "coccyx",
  "sternum",
  "ribs",
  "clavicle",
  "scapula",
  "humerus",
  "radius",
  "ulna",
  "carpals",
  "metacarpals",
  "phalanges",
  "pelvis",
  "femur",
  "patella",
  "tibia",
  "fibula",
  "talus",
  "calcaneus",
  "tarsals",
  "metatarsals",
] as const;

export type ModelStructureSlug = (typeof MODEL_STRUCTURE_SLUGS)[number];

const MODEL_SET = new Set<string>(MODEL_STRUCTURE_SLUGS);
export const hasModelMesh = (slug: string) => MODEL_SET.has(slug);

const CARPALS: Record<string, string> = {
  scaphoid: "Escafoide",
  lunate: "Semilunar",
  triquetral: "Piramidal",
  pisiform: "Pisiforme",
  trapezium: "Trapézio",
  trapezoid: "Trapezoide",
  capitate: "Capitato",
  hamate: "Hamato",
};

const SIMPLE: { key: string; slug: string; part: string }[] = [
  { key: "cranium", slug: "skull", part: "Crânio" },
  { key: "skull", slug: "skull", part: "Crânio" },
  { key: "mandible", slug: "mandible", part: "Mandíbula" },
  { key: "hyoid", slug: "hyoid", part: "Hioide" },
  { key: "sacrum", slug: "sacrum", part: "Sacro" },
  { key: "coccyx", slug: "coccyx", part: "Cóccix" },
  { key: "xiphoid", slug: "sternum", part: "Processo xifoide" },
  { key: "sternum", slug: "sternum", part: "Esterno" },
  { key: "clavicle", slug: "clavicle", part: "Clavícula" },
  { key: "scapula", slug: "scapula", part: "Escápula" },
  { key: "humerus", slug: "humerus", part: "Úmero" },
  { key: "radius", slug: "radius", part: "Rádio" },
  { key: "ulna", slug: "ulna", part: "Ulna" },
  { key: "oscoxa", slug: "pelvis", part: "Osso do quadril" },
  { key: "patella", slug: "patella", part: "Patela" },
  { key: "femur", slug: "femur", part: "Fêmur" },
  { key: "fibula", slug: "fibula", part: "Fíbula" },
  { key: "tibia", slug: "tibia", part: "Tíbia" },
  { key: "calcaneus", slug: "calcaneus", part: "Calcâneo" },
  { key: "talus", slug: "talus", part: "Tálus" },
  { key: "navicular", slug: "tarsals", part: "Navicular" },
  { key: "cuboid", slug: "tarsals", part: "Cuboide" },
];

const CUNEIFORM: Record<string, string> = {
  medial: "Cuneiforme medial",
  intermediate: "Cuneiforme intermédio",
  lateral: "Cuneiforme lateral",
};

const PHALANX: Record<string, string> = {
  proximal: "Falange proximal",
  intermediate: "Falange média",
  interemediate: "Falange média", // grafia do arquivo original
  distal: "Falange distal",
};

/** Remove o sufixo de malha do glTF (`Cranium__0`) e normaliza. */
function normalize(raw: string): string {
  return raw.toLowerCase().replace(/__\d+$/, "").replace(/\.\d+$/, "").trim();
}

export function classifyMeshName(raw: string): MeshPart | null {
  let n = normalize(raw);
  let side: BodySideKey | null = null;

  // Prefixo de lado: "l_femur", "r femur". Vértebras "l1".."l5" não têm separador.
  const sideMatch = /^([lr])[_ ](.+)$/.exec(n);
  if (sideMatch) {
    side = sideMatch[1] === "l" ? "left" : "right";
    n = sideMatch[2]!.trim();
  }
  // Os ossos do pé usam "_" entre as palavras ("metatarsal_1", "proximal_phalange_5")
  n = n.replace(/_/g, " ").replace(/\s+/g, " ").trim();

  let m: RegExpExecArray | null;
  if ((m = /^c([1-7])$/.exec(n))) return { slug: "cervical-vertebrae", part: `Vértebra C${m[1]}`, side: null };
  if ((m = /^t([1-9]|1[0-2])$/.exec(n))) return { slug: "thoracic-vertebrae", part: `Vértebra T${m[1]}`, side: null };
  if ((m = /^l([1-5])$/.exec(n))) return { slug: "lumbar-vertebrae", part: `Vértebra L${m[1]}`, side: null };

  if ((m = /^rib\s*(\d{1,2})$/.exec(n))) return { slug: "ribs", part: `Costela ${m[1]}`, side };
  if ((m = /^metacarpal\s*(\d)$/.exec(n))) return { slug: "metacarpals", part: `Metacarpal ${m[1]}`, side };
  if ((m = /^metatarsal\s*(\d)$/.exec(n))) return { slug: "metatarsals", part: `Metatarsal ${m[1]}`, side };

  if ((m = /^(proximal|intermediate|interemediate|distal)\s+phalange\s*(\d)$/.exec(n))) {
    return { slug: "phalanges", part: `${PHALANX[m[1]!]} ${m[2]}`, side };
  }
  if ((m = /^(medial|intermediate|lateral)\s+cuneiform$/.exec(n))) {
    return { slug: "tarsals", part: CUNEIFORM[m[1]!]!, side };
  }
  if (CARPALS[n]) return { slug: "carpals", part: CARPALS[n]!, side };

  // Sesamoides do hálux: visíveis no modelo, mas sem ficha própria no atlas
  if (n.startsWith("sesamoid")) return { slug: null, part: "Sesamoides do hálux", side };

  for (const rule of SIMPLE) {
    if (n.includes(rule.key)) return { slug: rule.slug, part: rule.part, side };
  }
  return null;
}

export function sideLabel(side: BodySideKey | null): string {
  if (side === "left") return "lado esquerdo";
  if (side === "right") return "lado direito";
  return "";
}

/** Ex.: "Costela 7 · lado direito" */
export function partDisplayName(p: MeshPart): string {
  const s = sideLabel(p.side);
  return s ? `${p.part} · ${s}` : p.part;
}
