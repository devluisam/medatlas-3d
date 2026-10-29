import { Markdown } from "@/components/ui/markdown";
import { Notice } from "@/components/ui/state";
import { Info } from "lucide-react";
import { categoryLabel, difficultyLabel, regionLabel, systemLabel } from "@/lib/labels";
import type { StructureDetail } from "@/server/structures";

/**
 * Seções de conteúdo de uma estrutura. Sem estado: renderiza igual no painel do
 * visualizador (cliente) e na página /atlas/[slug] (servidor).
 */

type S = Pick<StructureDetail, keyof StructureDetail>;

function Section({ title, children }: { title: string; children: string | null | undefined }) {
  if (!children?.trim()) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <Markdown>{children}</Markdown>
    </section>
  );
}

export function StructureMeta({ s }: { s: S }) {
  const items = [
    ["Sistema", systemLabel(s.system)],
    ["Região", regionLabel(s.region)],
    ["Tipo", categoryLabel(s.category)],
    ["Nível", difficultyLabel(s.difficulty)],
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{k}</dt>
          <dd className="truncate">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SummarySection({ s, showModelNotice = true }: { s: S; showModelNotice?: boolean }) {
  return (
    <div className="space-y-5">
      <Markdown>{s.summary}</Markdown>
      {s.commonNames.length > 0 && (
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground/80">Também chamado de:</span> {s.commonNames.join(", ")}
        </p>
      )}
      <StructureMeta s={s} />
      {showModelNotice && !s.hasModel && (
        <Notice icon={Info}>
          Esta estrutura ainda não tem malha no modelo 3D (hoje só o esqueleto é tridimensional). O conteúdo de estudo
          está completo abaixo.
        </Notice>
      )}
      {s.tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Palavras-chave">
          {s.tags.map((t) => (
            <li key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AnatomySection({ s }: { s: S }) {
  const any = [s.anatomyDetail, s.physiology, s.bloodSupply, s.venousDrainage, s.lymphDrainage, s.innervation, s.histology, s.embryology].some(
    (v) => v?.trim()
  );
  if (!any) return <p className="text-sm text-muted-foreground">Ainda não há descrição anatômica detalhada para esta estrutura.</p>;
  return (
    <div className="space-y-6">
      <Section title="Anatomia descritiva">{s.anatomyDetail}</Section>
      <Section title="Fisiologia e função">{s.physiology}</Section>
      <Section title="Irrigação arterial">{s.bloodSupply}</Section>
      <Section title="Drenagem venosa">{s.venousDrainage}</Section>
      <Section title="Drenagem linfática">{s.lymphDrainage}</Section>
      <Section title="Inervação">{s.innervation}</Section>
      <Section title="Histologia">{s.histology}</Section>
      <Section title="Embriologia">{s.embryology}</Section>
    </div>
  );
}

export function ClinicalSection({ s }: { s: S }) {
  const empty = !s.clinicalNotes?.trim() && !s.surgicalNotes?.trim() && s.pathologies.length === 0;
  if (empty) return <p className="text-sm text-muted-foreground">Ainda não há correlações clínicas cadastradas para esta estrutura.</p>;
  return (
    <div className="space-y-6">
      <Section title="Correlações clínicas">{s.clinicalNotes}</Section>
      <Section title="Notas cirúrgicas">{s.surgicalNotes}</Section>
      {s.pathologies.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Condições relacionadas</h3>
          {s.pathologies.map((p) => (
            <details key={p.id} className="group rounded-lg border border-border/80 bg-card/60 px-3 py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 text-sm font-medium">
                <span>{p.name}</span>
                {p.icd10Code && <span className="shrink-0 font-mono text-xs text-muted-foreground">CID-10 {p.icd10Code}</span>}
              </summary>
              <div className="space-y-3 pb-2 pt-2">
                <Markdown>{p.description}</Markdown>
                {p.symptoms.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Manifestações</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-foreground/85">
                      {p.symptoms.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Section title="Diagnóstico">{p.diagnosis}</Section>
                <Section title="Tratamento">{p.treatment}</Section>
                <Section title="Prognóstico">{p.prognosis}</Section>
              </div>
            </details>
          ))}
        </section>
      )}
      <p className="text-xs text-muted-foreground">
        Conteúdo educacional. Não use para diagnóstico ou conduta — consulte a literatura e profissionais habilitados.
      </p>
    </div>
  );
}
