import { DivisorRefeicoes } from "@/components/DivisorRefeicoes";
import { CAIXA, H1 } from "@/lib/layout";

export const metadata = { title: "Divisor de Refeições | Treino & Nutrição Consciente" };

export default function Pagina() {
  return (
    <section className={`${CAIXA} pb-24 pt-12 md:pt-20`}>
      <h1 className={H1}>Divisor de refeições.</h1>
      <p className="mt-5 max-w-[52ch] text-xl text-suave">
        Informe seus dados e veja proteína, carboidrato e gordura de cada refeição do dia.
      </p>
      <div className="mt-10">
        <DivisorRefeicoes />
      </div>
    </section>
  );
}
