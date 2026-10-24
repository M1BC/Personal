import { FormAcesso } from "@/components/FormAcesso";
import { CAIXA, H1 } from "@/lib/layout";

export const metadata = { title: "Entrar | Treino & Nutrição Consciente" };

export default function Pagina({ searchParams }: { searchParams: { erro?: string } }) {
  return (
    <section className={`${CAIXA} pb-24 pt-12 md:pt-20`}>
      <h1 className={H1}>Bom treino.</h1>
      <p className="mt-5 max-w-[52ch] text-xl text-suave">Entre para ver seu plano salvo em qualquer aparelho.</p>
      {searchParams.erro === "link" && (
        <p className="mt-6 max-w-md text-lg font-semibold text-primario">
          O link de confirmação expirou ou já foi usado. Entre com seu e-mail e senha.
        </p>
      )}
      <div className="mt-10">
        <FormAcesso modo="entrar" />
      </div>
    </section>
  );
}
