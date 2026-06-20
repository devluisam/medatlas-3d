// ================================================================
// MEDATLAS 3D — Core TypeScript Types
// ================================================================

export type {
  User,
  AnatomicalStructure,
  StructurePathology,
  Question,
  QuizAttempt,
  Flashcard,
  FlashcardSet,
  UserProgress,
  StudyStats,
  Achievement,
  AiConversation,
  StudyNote,
} from "@prisma/client";

export type {
  UserRole,
  PlanType,
  AnatomicalSystem,
  StructureCategory,
  BodyRegion,
  BodySide,
  QuestionType,
  AiMode,
  MessageRole,
} from "@prisma/client";

// ================================================================
// VIEWER TYPES
// ================================================================

export interface ViewerState {
  activeSystem: AnatomicalSystemKey | null;
  visibleSystems: Set<AnatomicalSystemKey>;
  selectedStructureId: string | null;
  highlightedStructureId: string | null;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  zoom: number;
  renderMode: RenderMode;
  cuttingPlane: CuttingPlane | null;
  isCutting: boolean;
  showWireframe: boolean;
  showXray: boolean;
  bodyGender: "male" | "female";
}

export type AnatomicalSystemKey =
  | "integumentary"
  | "muscular_superficial"
  | "muscular_deep"
  | "skeletal"
  | "nervous"
  | "arterial"
  | "venous"
  | "lymphatic"
  | "respiratory"
  | "digestive"
  | "urinary"
  | "endocrine"
  | "reproductive_male"
  | "reproductive_female";

export type RenderMode = "realistic" | "xray" | "wireframe" | "ghost" | "anatomical";

export interface CuttingPlane {
  axis: "sagittal" | "coronal" | "transversal" | "custom";
  position: number; // -1 to 1
  normal?: [number, number, number];
  visible: boolean;
}

export interface StructureHitInfo {
  structureId: string;
  structureName: string;
  system: AnatomicalSystemKey;
  position: [number, number, number];
  screenPosition: { x: number; y: number };
}

// ================================================================
// STUDY PANEL TYPES
// ================================================================

export type StudyTab =
  | "summary"
  | "anatomy"
  | "physiology"
  | "histology"
  | "embryology"
  | "pathologies"
  | "diagnosis"
  | "surgery"
  | "clinical_cases"
  | "questions"
  | "flashcards";

export interface StudyPanelState {
  isOpen: boolean;
  structureId: string | null;
  activeTab: StudyTab;
  isLoading: boolean;
}

// ================================================================
// SEARCH TYPES
// ================================================================

export interface SearchResult {
  id: string;
  slug: string;
  name: string;
  scientificName?: string;
  category: string;
  system: string;
  region: string;
  thumbnailUrl?: string;
  relevanceScore: number;
}

export interface SearchFilters {
  systems?: AnatomicalSystemKey[];
  categories?: string[];
  regions?: string[];
  difficulty?: string;
}

// ================================================================
// QUIZ TYPES
// ================================================================

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizConfig {
  mode: QuizMode;
  systems?: AnatomicalSystemKey[];
  difficulty?: Difficulty;
  questionCount: number;
  timeLimitSeconds?: number;
  includeImages?: boolean;
  includeClinical?: boolean;
}

export type QuizMode = "PRACTICE" | "TIMED" | "EXAM" | "CLINICAL";
export type Difficulty = "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export interface QuizSession {
  id: string;
  config: QuizConfig;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
  startedAt: Date;
  timeRemaining?: number;
  isComplete: boolean;
}

export interface QuizQuestion {
  id: string;
  type: string;
  difficulty: Difficulty;
  stem: string;
  context?: string;
  options: QuestionOption[];
  imageUrl?: string;
  structureId?: string;
  system?: AnatomicalSystemKey;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeTaken: number;
  xpEarned: number;
  bySystem: Record<string, { total: number; correct: number }>;
  byDifficulty: Record<string, { total: number; correct: number }>;
  weakAreas: string[];
}

// ================================================================
// AI TYPES
// ================================================================

export interface AiMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface AiContext {
  structureId?: string;
  structureName?: string;
  system?: AnatomicalSystemKey;
  studyLevel?: "BASIC" | "INTERMEDIATE" | "ADVANCED" | "RESIDENCY";
}

export interface AiRequest {
  message: string;
  conversationId?: string;
  context?: AiContext;
  mode?: "TUTOR" | "QUIZ_GENERATOR" | "SUMMARY" | "FLASHCARD_GENERATOR";
}

// ================================================================
// GAMIFICATION TYPES
// ================================================================

export interface XpEvent {
  type: XpEventType;
  amount: number;
  description: string;
  timestamp: Date;
}

export type XpEventType =
  | "STRUCTURE_VIEWED"
  | "STRUCTURE_MASTERED"
  | "QUIZ_COMPLETED"
  | "QUIZ_PERFECT"
  | "FLASHCARD_REVIEWED"
  | "STREAK_DAY"
  | "STREAK_WEEK"
  | "ACHIEVEMENT_UNLOCKED"
  | "NOTE_CREATED";

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  badge: string;
}

export const LEVEL_TABLE: LevelInfo[] = [
  { level: 1, title: "Calouro", minXp: 0, maxXp: 500, badge: "🔬" },
  { level: 2, title: "Estudante", minXp: 500, maxXp: 1500, badge: "📚" },
  { level: 3, title: "Acadêmico", minXp: 1500, maxXp: 3500, badge: "🧬" },
  { level: 4, title: "Residente", minXp: 3500, maxXp: 7000, badge: "🏥" },
  { level: 5, title: "Especialista", minXp: 7000, maxXp: 15000, badge: "⚕️" },
  { level: 6, title: "Mestre Anatômico", minXp: 15000, maxXp: 30000, badge: "🎓" },
  { level: 7, title: "Professor", minXp: 30000, maxXp: 60000, badge: "🏆" },
  { level: 8, title: "Cientista", minXp: 60000, maxXp: 100000, badge: "🧠" },
  { level: 9, title: "Médico Sênior", minXp: 100000, maxXp: 200000, badge: "👨‍⚕️" },
  { level: 10, title: "Lenda da Anatomia", minXp: 200000, maxXp: Infinity, badge: "🌟" },
];

// ================================================================
// LAYER CONFIG
// ================================================================

export interface LayerConfig {
  key: AnatomicalSystemKey;
  label: string;
  labelPt: string;
  color: string;
  glowColor: string;
  icon: string;
  order: number;
}

export const ANATOMICAL_LAYERS: LayerConfig[] = [
  { key: "integumentary", label: "Integumentary", labelPt: "Pele", color: "#f4a261", glowColor: "#f4a26166", icon: "skin", order: 1 },
  { key: "muscular_superficial", label: "Superficial Muscles", labelPt: "Músculos Superficiais", color: "#e63946", glowColor: "#e6394666", icon: "muscle", order: 2 },
  { key: "muscular_deep", label: "Deep Muscles", labelPt: "Músculos Profundos", color: "#c1121f", glowColor: "#c1121f66", icon: "muscle", order: 3 },
  { key: "skeletal", label: "Skeletal", labelPt: "Esquelético", color: "#e9ecef", glowColor: "#e9ecef66", icon: "bone", order: 4 },
  { key: "nervous", label: "Nervous", labelPt: "Nervoso", color: "#f8c537", glowColor: "#f8c53766", icon: "brain", order: 5 },
  { key: "arterial", label: "Arterial", labelPt: "Arterial", color: "#ef233c", glowColor: "#ef233c66", icon: "heart", order: 6 },
  { key: "venous", label: "Venous", labelPt: "Venoso", color: "#4361ee", glowColor: "#4361ee66", icon: "droplet", order: 7 },
  { key: "lymphatic", label: "Lymphatic", labelPt: "Linfático", color: "#80b918", glowColor: "#80b91866", icon: "activity", order: 8 },
  { key: "respiratory", label: "Respiratory", labelPt: "Respiratório", color: "#48cae4", glowColor: "#48cae466", icon: "wind", order: 9 },
  { key: "digestive", label: "Digestive", labelPt: "Digestório", color: "#fb8500", glowColor: "#fb850066", icon: "circle", order: 10 },
  { key: "urinary", label: "Urinary", labelPt: "Urinário", color: "#ffd166", glowColor: "#ffd16666", icon: "droplet", order: 11 },
  { key: "endocrine", label: "Endocrine", labelPt: "Endócrino", color: "#a8dadc", glowColor: "#a8dadc66", icon: "zap", order: 12 },
  { key: "reproductive_male", label: "Male Reproductive", labelPt: "Reprodutor Masc.", color: "#5390d9", glowColor: "#5390d966", icon: "user", order: 13 },
  { key: "reproductive_female", label: "Female Reproductive", labelPt: "Reprodutor Fem.", color: "#ff70a6", glowColor: "#ff70a666", icon: "user", order: 14 },
];
