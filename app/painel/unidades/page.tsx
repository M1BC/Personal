import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { Unidades } from "@/components/painel/Unidades";
import { CAIXA } from "@/lib/layout";
import { criarClienteServidor } from "@/lib/supabase/server";

export const metadata = { title: "Unidades" };

export default async function Pagina() {
  const supabase = criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = user ? await supabase.from("perfis").select("papel").eq("id", user.id).maybeSingle() : { data: null };
  if (data?.papel !== "admin") redirect("/painel");

  return (
    <>
      <CabecalhoPagina
        titulo="Unidades."
        texto="As filiais da rede. As unidades ativas aparecem na lista do cadastro para o aluno escolher onde treina."
      />
      <section className={`${CAIXA} pb-24 pt-8 md:pt-12`}>
        <Unidades />
      </section>
    </>
  );
}
