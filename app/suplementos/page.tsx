import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { Suplementos } from "@/components/Suplementos";
import { CAIXA } from "@/lib/layout";

export const metadata = { title: "Suplementos" };

export default function Pagina() {
  return (
    <>
      <CabecalhoPagina
        titulo="O que vale o seu dinheiro."
        texto="Escolha quanto pode gastar e veja o que priorizar, com o que a ciência diz sobre cada um."
      />
      <section className={`${CAIXA} pb-24 pt-8 md:pt-12`}>
        <Suplementos />
      </section>
    </>
  );
}
