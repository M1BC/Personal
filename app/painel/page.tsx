import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { ListaAlunos } from "@/components/painel/ListaAlunos";
import { CAIXA } from "@/lib/layout";

export const metadata = { title: "Painel" };

export default function Pagina() {
  return (
    <>
      <CabecalhoPagina titulo="Painel do treinador." texto="Escolha um aluno para montar ou ajustar a ficha dele." />
      <section className={`${CAIXA} pb-24 pt-8 md:pt-12`}>
        <ListaAlunos />
      </section>
    </>
  );
}
