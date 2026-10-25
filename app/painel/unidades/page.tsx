import { redirect } from "next/navigation";
import { Unidades } from "@/components/painel/Unidades";
import { CAIXA, H1 } from "@/lib/layout";
import { criarClienteServidor } from "@/lib/supabase/server";

export const metadata = { title: "Unidades | Treino & Nutrição Consciente" };

export default async function Pagina() {
  const supabase = criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = user ? await supabase.from("perfis").select("papel").eq("id", user.id).maybeSingle() : { data: null };
  if (data?.papel !== "admin") redirect("/painel");

  return (
    <section className={`${CAIXA} pb-24 pt-12 md:pt-20`}>
      <h1 className={H1}>Unidades.</h1>
      <p className="mt-5 max-w-[56ch] text-xl text-suave">
        As filiais da rede. As unidades ativas aparecem na lista do cadastro para o aluno escolher onde treina.
      </p>
      <div className="mt-10">
        <Unidades />
      </div>
    </section>
  );
}
