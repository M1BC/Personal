import { Treinos } from "@/components/Treinos";
import { CAIXA, H1 } from "@/lib/layout";

export const metadata = { title: "Treinos | Treino & Nutrição Consciente" };

export default function Pagina() {
  return (
    <section className={`${CAIXA} pb-24 pt-12 md:pt-20`}>
      <h1 className={H1}>Treino para o seu objetivo.</h1>
      <p className="mt-5 max-w-[52ch] text-xl text-suave">
        Escolha quantas vezes por semana você treina e o seu objetivo. A ficha mostra a divisão dos dias, as séries, o descanso e o motivo de cada exercício.
      </p>
      <div className="mt-10">
        <Treinos />
      </div>
    </section>
  );
}
