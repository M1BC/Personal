import { redirect } from "next/navigation";
import { Equipe } from "@/components/painel/Equipe";
import { CAIXA, H1 } from "@/lib/layout";
import { criarClienteServidor } from "@/lib/supabase/server";

export const metadata = { title: "Equipe | Treino & Nutrição Consciente" };

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
    <section className={`${CAIXA} pb-24 pt-12 md:pt-20`}>
      <h1 className={H1}>Equipe.</h1>
      <p className="mt-5 max-w-[56ch] text-xl text-suave">
        Todo mundo que cria conta entra como aluno. Aqui você define o papel de cada pessoa e a unidade onde ela treina ou trabalha.
      </p>
      <div className="mt-10">
        <Equipe meuId={user!.id} admin={papel === "admin"} />
      </div>
    </section>
  );
}
