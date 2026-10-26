import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { Treinos } from "@/components/Treinos";
import { CAIXA } from "@/lib/layout";

export const metadata = { title: "Treinos" };

export default function Pagina() {
  return (
    <>
      <CabecalhoPagina
        titulo="Treino para o seu objetivo."
        texto="Escolha quantas vezes por semana você treina e o seu objetivo. A ficha mostra a divisão dos dias, as séries, o descanso e o motivo de cada exercício."
      />
      <section className={`${CAIXA} pb-24 pt-8 md:pt-12`}>
        <Treinos />
      </section>
    </>
  );
}
