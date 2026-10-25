import { ListaAlunos } from "@/components/painel/ListaAlunos";
import { CAIXA, H1 } from "@/lib/layout";

export const metadata = { title: "Painel | Treino & Nutrição Consciente" };

export default function Pagina() {
  return (
    <section className={`${CAIXA} pb-24 pt-12 md:pt-20`}>
      <h1 className={H1}>Painel do treinador.</h1>
      <p className="mt-5 max-w-[52ch] text-xl text-suave">Escolha um aluno para montar ou ajustar a ficha dele.</p>
      <div className="mt-10">
        <ListaAlunos />
      </div>
    </section>
  );
}
