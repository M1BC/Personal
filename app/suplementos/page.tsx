import { Suplementos } from "@/components/Suplementos";
import { CAIXA, H1 } from "@/lib/layout";

export const metadata = { title: "Suplementos | Treino & Nutrição Consciente" };

export default function Pagina() {
  return (
    <section className={`${CAIXA} pb-24 pt-12 md:pt-20`}>
      <h1 className={H1}>O que vale o seu dinheiro.</h1>
      <p className="mt-5 max-w-[52ch] text-xl text-suave">Escolha quanto pode gastar e veja o que priorizar, com o que a ciência diz sobre cada um.</p>
      <div className="mt-10">
        <Suplementos />
      </div>
    </section>
  );
}
