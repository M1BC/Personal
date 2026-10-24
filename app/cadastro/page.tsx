import { FormAcesso } from "@/components/FormAcesso";
import { CAIXA, H1 } from "@/lib/layout";

export const metadata = { title: "Criar conta | Treino & Nutrição Consciente" };

export default function Pagina() {
  return (
    <section className={`${CAIXA} pb-24 pt-12 md:pt-20`}>
      <h1 className={H1}>Crie sua conta.</h1>
      <p className="mt-5 max-w-[52ch] text-xl text-suave">
        Seu peso, metas e refeições ficam salvos na nuvem e aparecem no celular e no computador.
      </p>
      <div className="mt-10">
        <FormAcesso modo="cadastrar" />
      </div>
    </section>
  );
}
