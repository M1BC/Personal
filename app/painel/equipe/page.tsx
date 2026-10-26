import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { Equipe } from "@/components/painel/Equipe";
import { CAIXA } from "@/lib/layout";
import { criarClienteServidor } from "@/lib/supabase/server";

export const metadata = { title: "Equipe" };

export default async function Pagina() {
  // Administrador cuida de todos; gerente, da própria unidade (o banco também exige isso).
  const supabase = criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = user ? await supabase.from("perfis").select("papel").eq("id", user.id).maybeSingle() : { data: null };
  const papel = data?.papel;
  if (papel !== "admin" && papel !== "gerente") redirect("/painel");

  return (
    <>
      <CabecalhoPagina
        titulo="Equipe."
        texto="Todo mundo que cria conta entra como aluno. Aqui você define o papel de cada pessoa e a unidade onde ela treina ou trabalha."
      />
      <section className={`${CAIXA} pb-24 pt-8 md:pt-12`}>
        <Equipe meuId={user!.id} admin={papel === "admin"} />
      </section>
    </>
  );
}
