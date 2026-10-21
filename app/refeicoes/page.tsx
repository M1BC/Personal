import { Refeicoes } from "@/components/Refeicoes";
import { CAIXA, H1 } from "@/lib/layout";

export const metadata = { title: "Refeições | Treino & Nutrição Consciente" };

export default function Pagina() {
  return (
    <section className={`${CAIXA} pb-24 pt-12 md:pt-20`}>
      <h1 className={H1}>Seu dia alimentar, refeição por refeição.</h1>
      <p className="mt-5 max-w-[52ch] text-xl text-suave">
        Informe seu peso atual e seu peso meta para ver o plano, a projeção de tempo e cardápios com comida do dia a dia.
      </p>
      <div className="mt-10">
        <Refeicoes />
      </div>
    </section>
  );
}
