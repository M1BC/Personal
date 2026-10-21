import { ExplorerExercicios } from "@/components/ExplorerExercicios";
import { CAIXA, H1 } from "@/lib/layout";

export const metadata = { title: "Anatomia | Treino & Nutrição Consciente" };

export default function Pagina() {
  return (
    <section className={`${CAIXA} pb-24 pt-12 md:pt-20`}>
      <h1 className={H1}>Cada exercício tem um motivo.</h1>
      <p className="mt-5 max-w-[52ch] text-xl text-suave">Escolha um exercício, veja quais músculos trabalham e como um depende do outro.</p>
      <div className="mt-10">
        <ExplorerExercicios />
      </div>
    </section>
  );
}
