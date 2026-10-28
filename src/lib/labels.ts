/**
 * Rótulos em português dos enums do banco e metadados dos sistemas anatômicos.
 * Compartilhado entre servidor e cliente (sem dependência do Prisma em runtime).
 */

export const SYSTEM_KEYS = [
  "SKELETAL",
  "MUSCULAR_SUPERFICIAL",
  "MUSCULAR_DEEP",
  "NERVOUS",
  "CARDIOVASCULAR",
  "ARTERIAL",
  "VENOUS",
  "LYMPHATIC",
  "RESPIRATORY",
  "DIGESTIVE",
  "URINARY",
  "ENDOCRINE",
  "INTEGUMENTARY",
  "REPRODUCTIVE_MALE",
  "REPRODUCTIVE_FEMALE",
  "IMMUNE",
] as const;
export type SystemKey = (typeof SYSTEM_KEYS)[number];

export interface SystemMeta {
  key: SystemKey;
  label: string;
  color: string;
  /** Há malha deste sistema no modelo 3D atual */
  hasModel: boolean;
}

export const SYSTEMS: Record<SystemKey, SystemMeta> = {
  SKELETAL: { key: "SKELETAL", label: "Esquelético", color: "#e7dcc4", hasModel: true },
  MUSCULAR_SUPERFICIAL: { key: "MUSCULAR_SUPERFICIAL", label: "Muscular superficial", color: "#e26d5c", hasModel: false },
  MUSCULAR_DEEP: { key: "MUSCULAR_DEEP", label: "Muscular profundo", color: "#b8483b", hasModel: false },
  NERVOUS: { key: "NERVOUS", label: "Nervoso", color: "#f2c14e", hasModel: false },
  CARDIOVASCULAR: { key: "CARDIOVASCULAR", label: "Cardiovascular", color: "#e05263", hasModel: false },
  ARTERIAL: { key: "ARTERIAL", label: "Arterial", color: "#d64550", hasModel: false },
  VENOUS: { key: "VENOUS", label: "Venoso", color: "#5b7fd6", hasModel: false },
  LYMPHATIC: { key: "LYMPHATIC", label: "Linfático", color: "#8bbf5a", hasModel: false },
  RESPIRATORY: { key: "RESPIRATORY", label: "Respiratório", color: "#5fc4d9", hasModel: false },
  DIGESTIVE: { key: "DIGESTIVE", label: "Digestório", color: "#e8954a", hasModel: false },
  URINARY: { key: "URINARY", label: "Urinário", color: "#e9c46a", hasModel: false },
  ENDOCRINE: { key: "ENDOCRINE", label: "Endócrino", color: "#9fd3c7", hasModel: false },
  INTEGUMENTARY: { key: "INTEGUMENTARY", label: "Tegumentar", color: "#d9a07a", hasModel: false },
  REPRODUCTIVE_MALE: { key: "REPRODUCTIVE_MALE", label: "Reprodutor masculino", color: "#6c9bd2", hasModel: false },
  REPRODUCTIVE_FEMALE: { key: "REPRODUCTIVE_FEMALE", label: "Reprodutor feminino", color: "#e58fb2", hasModel: false },
  IMMUNE: { key: "IMMUNE", label: "Imune", color: "#a3b18a", hasModel: false },
};

export const systemLabel = (key: string) => SYSTEMS[key as SystemKey]?.label ?? key;

export const CATEGORY_LABELS: Record<string, string> = {
  BONE: "Osso",
  MUSCLE: "Músculo",
  NERVE: "Nervo",
  ARTERY: "Artéria",
  VEIN: "Veia",
  LYMPH_NODE: "Linfonodo",
  LYMPH_VESSEL: "Vaso linfático",
  ORGAN: "Órgão",
  GLAND: "Glândula",
  CARTILAGE: "Cartilagem",
  LIGAMENT: "Ligamento",
  TENDON: "Tendão",
  FASCIA: "Fáscia",
  SKIN: "Pele",
  JOINT: "Articulação",
  VESSEL: "Vaso",
  OTHER: "Outro",
};
export const categoryLabel = (key: string) => CATEGORY_LABELS[key] ?? key;

export const REGION_LABELS: Record<string, string> = {
  HEAD: "Cabeça",
  NECK: "Pescoço",
  THORAX: "Tórax",
  ABDOMEN: "Abdome",
  PELVIS: "Pelve",
  PERINEUM: "Períneo",
  UPPER_LIMB_SHOULDER: "Ombro",
  UPPER_LIMB_ARM: "Braço",
  UPPER_LIMB_FOREARM: "Antebraço",
  UPPER_LIMB_HAND: "Mão",
  LOWER_LIMB_THIGH: "Coxa",
  LOWER_LIMB_LEG: "Perna",
  LOWER_LIMB_FOOT: "Pé",
  SPINE: "Coluna vertebral",
  BACK: "Dorso",
};
export const regionLabel = (key: string) => REGION_LABELS[key] ?? key;

export const DIFFICULTY_LABELS: Record<string, string> = {
  BASIC: "Básico",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
  EXPERT: "Especialista",
};
export const difficultyLabel = (key: string) => DIFFICULTY_LABELS[key] ?? key;

export const QUIZ_MODE_LABELS: Record<string, string> = {
  PRACTICE: "Prática",
  TIMED: "Cronometrado",
  EXAM: "Simulado",
  CLINICAL: "Casos clínicos",
};

export const ORIGIN_LABELS = {
  CURATED: "Conteúdo do atlas",
  AI_GENERATED: "Gerado por IA",
} as const;
