import Link from "next/link";
import { MODEL_CREDIT } from "@/lib/anatomy/model-credit";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 py-8 text-sm text-muted-foreground">
      <div className="container flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl space-y-2">
          <p>
            MEDATLAS 3D é um projeto educacional. O conteúdo apoia o estudo de anatomia e não substitui livros-texto,
            aulas nem orientação de profissionais de saúde.
          </p>
          <p>
            Modelo 3D:{" "}
            <a href={MODEL_CREDIT.sourceUrl} className="underline underline-offset-2 hover:text-foreground" rel="noopener noreferrer" target="_blank">
              “{MODEL_CREDIT.title}”
            </a>{" "}
            por {MODEL_CREDIT.author}, licença{" "}
            <a href={MODEL_CREDIT.licenseUrl} className="underline underline-offset-2 hover:text-foreground" rel="noopener noreferrer" target="_blank">
              {MODEL_CREDIT.license}
            </a>
            . {MODEL_CREDIT.changes}
          </p>
        </div>
        <nav aria-label="Rodapé" className="flex gap-4">
          <Link href="/atlas" className="hover:text-foreground">
            Conteúdo
          </Link>
          <Link href="/privacidade" className="hover:text-foreground">
            Privacidade
          </Link>
          <a href="https://github.com/devluisam/medatlas-3d" className="hover:text-foreground" rel="noopener noreferrer" target="_blank">
            Código
          </a>
        </nav>
      </div>
    </footer>
  );
}
