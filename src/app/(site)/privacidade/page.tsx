import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = { title: "Privacidade e termos" };

export default function PrivacyPage() {
  return (
    <PageShell>
      <article className="container prose prose-invert max-w-3xl py-12 prose-headings:font-display">
        <h1>Privacidade e termos de uso</h1>
        <p>
          O MEDATLAS 3D é um projeto educacional pessoal, sem fins comerciais. Esta página explica, em linguagem direta, que dados são
          guardados e para quê.
        </p>

        <h2>O que guardamos</h2>
        <ul>
          <li>
            <strong>Conta:</strong> nome, email e a senha em forma de hash (bcrypt) — a senha em si nunca é gravada. Se você entrar com
            Google, guardamos o identificador da conta Google.
          </li>
          <li>
            <strong>Estudo:</strong> estruturas abertas, tempo com o painel de estudo aberto, respostas de quiz, revisões de flashcards,
            favoritos e anotações.
          </li>
          <li>
            <strong>Tutor de IA:</strong> as perguntas e respostas das suas conversas, para você retomar depois, e a contagem de uso para o
            limite diário.
          </li>
        </ul>

        <h2>Para que usamos</h2>
        <p>
          Só para fazer o atlas funcionar para você: painel de progresso, agendamento das revisões, histórico de quizzes e conversas. Não
          há anúncios, venda de dados nem rastreadores de terceiros.
        </p>

        <h2>Com quem compartilhamos</h2>
        <p>
          Quando você usa o tutor ou gera questões com IA, o texto da pergunta e trechos do conteúdo do atlas são enviados ao provedor de
          IA configurado (OpenAI) para gerar a resposta. Não envie dados pessoais ou de pacientes nessas mensagens.
        </p>

        <h2>Seus direitos</h2>
        <p>
          Você pode apagar anotações e conversas a qualquer momento. Para excluir a conta e todos os dados associados, abra uma issue no{" "}
          <a href="https://github.com/devluisam/medatlas-3d" target="_blank" rel="noopener noreferrer">
            repositório do projeto
          </a>{" "}
          ou escreva para o mantenedor; a exclusão é feita em até 15 dias.
        </p>

        <h2 id="termos">Termos de uso</h2>
        <ul>
          <li>O conteúdo é material de estudo. Não use para diagnóstico, prescrição ou qualquer conduta clínica.</li>
          <li>Respostas e questões geradas por IA podem conter erros; a interface sempre identifica o que foi gerado por IA.</li>
          <li>Não tente burlar os limites de uso nem acessar dados de outras pessoas.</li>
          <li>
            O modelo 3D é de terceiros, sob licença CC BY 4.0, com a atribuição exibida no rodapé e no visualizador.
          </li>
          <li>O serviço é oferecido como está, sem garantia de disponibilidade.</li>
        </ul>
      </article>
    </PageShell>
  );
}
