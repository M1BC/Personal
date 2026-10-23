import { Suspense } from "react";
import { TreinoAtivo } from "@/components/TreinoAtivo";
import { CAIXA, H1 } from "@/lib/layout";

export const metadata = { title: "Treino ativo | Treino & Nutrição Consciente" };

export default function Pagina() {
  return (
    <section className={`${CAIXA} pb-24 pt-12 md:pt-20`}>
      <h1 className={H1}>Treino ativo.</h1>
      <p className="mt-5 max-w-[52ch] text-xl text-suave">Anote o peso e as repetições de cada série e marque os exercícios que já fez.</p>
      <div className="mt-10">
        {/* o hook que lê os parâmetros da URL exige Suspense para o build estático do Next */}
        <Suspense fallback={<p className="text-lg text-suave">Carregando treino...</p>}>
          <TreinoAtivo />
        </Suspense>
      </div>
    </section>
  );
}
