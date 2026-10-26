import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { Refeicoes } from "@/components/Refeicoes";
import { CAIXA } from "@/lib/layout";

export const metadata = { title: "Refeições" };

export default function Pagina() {
  return (
    <>
      <CabecalhoPagina
        titulo="Seu dia alimentar, refeição por refeição."
        texto="Informe seu peso atual e seu peso meta para ver o plano e a projeção de tempo. Ligue “Personalizar distribuição” para montar o seu prato, escolhendo o que vai comer em cada refeição."
      />
      <section className={`${CAIXA} pb-24 pt-8 md:pt-12`}>
        <Refeicoes />
      </section>
    </>
  );
}
