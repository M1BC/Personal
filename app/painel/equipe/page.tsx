import { redirect } from "next/navigation";
import { Equipe } from "@/components/painel/Equipe";
import { CAIXA, H1 } from "@/lib/layout";
import { criarClienteServidor } from "@/lib/supabase/server";

export const metadata = { title: "Equipe | Treino & Nutrição Consciente" };

export default async function Pagina() {
  // Só o administrador muda papéis (o banco também exige isso).
  const supabase = criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = user ? await supabase.from("perfis").select("papel").eq("id", user.id).maybeSingle() : { data: null };
  if (data?.papel !== "admin") redirect("/painel");

  return (
    <section className={`${CAIXA} pb-24 pt-12 md:pt-20`}>
      <h1 className={H1}>Equipe.</h1>
      <p className="mt-5 max-w-[56ch] text-xl text-suave">
        Todo mundo que cria conta entra como aluno. Aqui você transforma uma conta em treinador ou administrador.
      </p>
      <div className="mt-10">
        <Equipe meuId={user!.id} />
      </div>
    </section>
  );
}
