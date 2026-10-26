import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { ExplorerExercicios } from "@/components/ExplorerExercicios";
import { CAIXA } from "@/lib/layout";

export const metadata = { title: "Anatomia" };

export default function Pagina() {
  return (
    <>
      <CabecalhoPagina
        titulo="Cada exercício tem um motivo."
        texto="Escolha um exercício, veja quais músculos trabalham e como um depende do outro."
      />
      <section className={`${CAIXA} pb-24 pt-8 md:pt-12`}>
        <ExplorerExercicios />
      </section>
    </>
  );
}
