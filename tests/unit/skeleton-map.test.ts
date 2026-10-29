import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { classifyMeshName, hasModelMesh, MODEL_STRUCTURE_SLUGS } from "@/lib/anatomy/skeleton-map";

/** Nomes dos nós do GLB, lidos do bloco JSON (não precisa decodificar a geometria). */
function glbNodeNames(file: string): { meshNodes: string[] } {
  const buf = readFileSync(file);
  expect(buf.toString("ascii", 0, 4)).toBe("glTF");
  const jsonLength = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.toString("utf8", 20, 20 + jsonLength)) as {
    nodes: { name?: string; mesh?: number; children?: number[] }[];
  };
  const parentOf = new Map<number, number>();
  gltf.nodes.forEach((n, i) => n.children?.forEach((c) => parentOf.set(c, i)));
  // Mesmo critério do visualizador: nome da malha ou, se não servir, do nó pai
  const meshNodes = gltf.nodes
    .map((n, i) => ({ n, i }))
    .filter(({ n }) => n.mesh !== undefined)
    .map(({ n, i }) => {
      const own = n.name ?? "";
      const parent = parentOf.has(i) ? (gltf.nodes[parentOf.get(i)!]!.name ?? "") : "";
      return classifyMeshName(own) ? own : parent || own;
    });
  return { meshNodes };
}

const MODEL = path.resolve(__dirname, "../../public/models/skeleton.glb");

describe("mapeamento do modelo 3D", () => {
  const { meshNodes } = glbNodeNames(MODEL);

  it("reconhece todas as malhas do GLB", () => {
    const unmatched = meshNodes.filter((name) => !classifyMeshName(name));
    expect(unmatched).toEqual([]);
    expect(meshNodes.length).toBeGreaterThan(150);
  });

  it("toda estrutura anunciada como 3D tem pelo menos uma malha", () => {
    const slugs = new Set(meshNodes.map((n) => classifyMeshName(n)?.slug).filter(Boolean));
    for (const slug of MODEL_STRUCTURE_SLUGS) expect(slugs, slug).toContain(slug);
  });

  it("lê lado e número com '_' ou espaço", () => {
    expect(classifyMeshName("l_metatarsal_1__0")).toEqual({ slug: "metatarsals", part: "Metatarsal 1", side: "left" });
    expect(classifyMeshName("r_proximal_phalange_5")).toMatchObject({ slug: "phalanges", side: "right" });
    expect(classifyMeshName("l_interemediate_phalange_5__0")).toMatchObject({ part: "Falange média 5" });
    expect(classifyMeshName("r_lateral_cuneiform")).toMatchObject({ slug: "tarsals", part: "Cuneiforme lateral" });
    expect(classifyMeshName("l cuboid")).toMatchObject({ slug: "tarsals", side: "left" });
    expect(classifyMeshName("l5")).toMatchObject({ slug: "lumbar-vertebrae", side: null });
  });

  it("hasModelMesh só para estruturas com malha", () => {
    expect(hasModelMesh("femur")).toBe(true);
    expect(hasModelMesh("heart")).toBe(false);
  });
});
