import { Historico } from "@/components/Historico";
import { CAIXA, H1 } from "@/lib/layout";

export const metadata = { title: "Histórico | Treino & Nutrição Consciente" };

export default function Pagina() {
  return (
    <section className={`${CAIXA} pb-24 pt-12 md:pt-20`}>
      <h1 className={H1}>Seu caderno de treinos.</h1>
      <p className="mt-5 max-w-[52ch] text-xl text-suave">Os treinos que você finalizou, do mais recente para o mais antigo.</p>
      <div className="mt-10">
        <Historico />
      </div>
    </section>
  );
}
