import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "@/lib/safe-redirect";

describe("safeCallbackUrl", () => {
  it("aceita caminhos internos com query e hash", () => {
    expect(safeCallbackUrl("/viewer?s=femur")).toBe("/viewer?s=femur");
    expect(safeCallbackUrl(encodeURIComponent("/atlas/femur#clinica"))).toBe("/atlas/femur#clinica");
  });

  it.each([
    "https://evil.example/x",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "%2F%2Fevil.example",
    "/%0d%0aSet-Cookie:x",
    "",
    null,
  ])("recusa %s", (raw) => {
    expect(safeCallbackUrl(raw as string | null)).toBe("/dashboard");
  });
});
