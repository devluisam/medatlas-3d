/**
 * Normaliza texto para busca: sem acento, minúsculo, espaços colapsados.
 *
 * Existe porque o Postgres compara acento literalmente — quem digita "femur"
 * não encontrava "Fêmur". Em vez de depender da extensão `unaccent` do banco,
 * cada estrutura guarda uma versão normalizada (`searchText`) e a busca
 * normaliza o termo da mesma forma. Funciona igual em qualquer Postgres.
 */
export function normalizeForSearch(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Campo de lista do Prisma: aceita `string[]` ou a forma `{ set: [...] }`. */
type ListaPrisma = string[] | { set?: string[] } | null | undefined;

function paraArray(valor: ListaPrisma): string[] {
  if (Array.isArray(valor)) return valor;
  if (valor && Array.isArray(valor.set)) return valor.set;
  return [];
}

/** Junta os campos pesquisáveis de uma estrutura num único texto normalizado. */
export function buildSearchText(parts: {
  name: string;
  scientificName?: string | null;
  commonNames?: ListaPrisma;
  tags?: ListaPrisma;
}): string {
  return normalizeForSearch(
    [parts.name, parts.scientificName ?? "", ...paraArray(parts.commonNames), ...paraArray(parts.tags)]
      .filter(Boolean)
      .join(" ")
  );
}
