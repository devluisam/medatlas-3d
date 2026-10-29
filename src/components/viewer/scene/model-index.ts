import * as THREE from "three";
import { classifyMeshName, partDisplayName, type MeshPart } from "@/lib/anatomy/skeleton-map";

/**
 * Prepara o modelo carregado para o atlas:
 * - orienta o esqueleto em pé (o GLB original vem com Z para cima, deitado)
 *   usando marcos anatômicos do próprio arquivo;
 * - normaliza a altura e apoia os pés no chão;
 * - dá a cada estrutura um material próprio (destaque, transparência e corte
 *   independentes) e guarda as caixas envolventes para enquadrar a câmera.
 */

export const MODEL_HEIGHT = 1.8;
const UNMAPPED = "__sem-ficha";

export interface ModelIndex {
  root: THREE.Group;
  meshesBySlug: Map<string, THREE.Mesh[]>;
  materials: Map<string, THREE.MeshStandardMaterial>;
  boxes: Map<string, THREE.Box3>;
  bounds: THREE.Box3;
  /** Direções no espaço da cena (unitárias) */
  anterior: THREE.Vector3;
  left: THREE.Vector3;
  unmatched: string[];
  dispose: () => void;
}

export interface PartUserData {
  part: MeshPart;
  label: string;
}

/** Peça anatômica de uma malha (sobe na hierarquia se a malha não tiver nome útil). */
export function partOf(object: THREE.Object3D | null): PartUserData | null {
  let current: THREE.Object3D | null = object;
  for (let depth = 0; current && depth < 4; depth++) {
    const data = current.userData?.medatlas as PartUserData | undefined;
    if (data) return data;
    current = current.parent;
  }
  return null;
}

function centerOf(meshes: THREE.Mesh[] | undefined): THREE.Vector3 | null {
  if (!meshes?.length) return null;
  const box = new THREE.Box3();
  for (const m of meshes) box.expandByObject(m);
  return box.getCenter(new THREE.Vector3());
}

const BONE_COLOR = new THREE.Color("#e4d9c3");

export function buildModelIndex(scene: THREE.Object3D): ModelIndex {
  const model = scene.clone(true);
  const root = new THREE.Group();
  root.name = "medatlas-root";
  root.add(model);

  const meshesBySlug = new Map<string, THREE.Mesh[]>();
  const sidesBySlug = new Map<"left" | "right", THREE.Mesh[]>();
  const unmatched: string[] = [];

  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    // O nome útil pode estar na malha ou no nó pai ("Cranium" > "Cranium__0")
    const part = classifyMeshName(child.name) ?? (child.parent ? classifyMeshName(child.parent.name) : null);
    if (!part) {
      unmatched.push(child.name || child.parent?.name || "(sem nome)");
      return;
    }
    const key = part.slug ?? UNMAPPED;
    child.userData.medatlas = { part, label: partDisplayName(part) } satisfies PartUserData;
    meshesBySlug.set(key, [...(meshesBySlug.get(key) ?? []), child]);
    if (part.side) sidesBySlug.set(part.side, [...(sidesBySlug.get(part.side) ?? []), child]);
    child.castShadow = false;
    child.receiveShadow = false;
  });

  // ── Orientação anatômica ───────────────────────────────────────
  root.updateMatrixWorld(true);
  const head = centerOf(meshesBySlug.get("skull"));
  const feet = centerOf(meshesBySlug.get("calcaneus"));
  // A frente vem de três pares (costelas × coluna, patela × fêmur, metatarsos ×
  // calcâneo). Esterno e mandíbula não servem: neste arquivo estão deslocados
  // para o lado, e usá-los fazia a vista "anterior" mostrar o perfil.
  const fwd = new THREE.Vector3();
  for (const [front, back] of [
    ["ribs", "thoracic-vertebrae"],
    ["patella", "femur"],
    ["metatarsals", "calcaneus"],
  ] as const) {
    const a = centerOf(meshesBySlug.get(front));
    const b = centerOf(meshesBySlug.get(back));
    if (a && b) fwd.add(a.sub(b));
  }
  if (head && feet && fwd.lengthSq() > 0) {
    const up = head.clone().sub(feet).normalize();
    fwd.addScaledVector(up, -fwd.dot(up)).normalize();
    const x = new THREE.Vector3().crossVectors(up, fwd).normalize();
    const basis = new THREE.Matrix4().makeBasis(x, up, fwd);
    // A base leva (X,Y,Z) para (x, cima, frente); a inversa põe o corpo em pé, de frente para +Z
    model.quaternion.premultiply(new THREE.Quaternion().setFromRotationMatrix(basis).invert());
  }

  // ── Escala e posição: pés em y = 0, centrado em x/z ────────────
  root.updateMatrixWorld(true);
  const raw = new THREE.Box3().setFromObject(model);
  const height = raw.max.y - raw.min.y || 1;
  model.scale.multiplyScalar(MODEL_HEIGHT / height);
  root.updateMatrixWorld(true);
  const scaled = new THREE.Box3().setFromObject(model);
  const center = scaled.getCenter(new THREE.Vector3());
  model.position.sub(new THREE.Vector3(center.x, scaled.min.y, center.z));
  root.updateMatrixWorld(true);

  // ── Materiais por estrutura e caixas ───────────────────────────
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const boxes = new Map<string, THREE.Box3>();
  for (const [slug, meshes] of meshesBySlug) {
    const material = new THREE.MeshStandardMaterial({
      color: BONE_COLOR,
      roughness: 0.68,
      metalness: 0.02,
      envMapIntensity: 0.9,
    });
    material.name = `medatlas:${slug}`;
    materials.set(slug, material);
    const box = new THREE.Box3();
    for (const mesh of meshes) {
      mesh.material = material;
      box.expandByObject(mesh);
    }
    boxes.set(slug, box);
  }

  const bounds = new THREE.Box3().setFromObject(root);
  const leftCenter = centerOf(sidesBySlug.get("left"));
  const left =
    leftCenter && Math.abs(leftCenter.x) > 0.01 ? new THREE.Vector3(Math.sign(leftCenter.x), 0, 0) : new THREE.Vector3(1, 0, 0);

  return {
    root,
    meshesBySlug,
    materials,
    boxes,
    bounds,
    anterior: new THREE.Vector3(0, 0, 1),
    left,
    unmatched,
    dispose: () => {
      for (const m of materials.values()) m.dispose();
    },
  };
}

export const UNMAPPED_KEY = UNMAPPED;
