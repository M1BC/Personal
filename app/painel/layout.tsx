import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { criarClienteServidor } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Só treinadores, gerentes e administradores entram no painel. As regras do banco também bloqueiam os dados.
export default async function LayoutPainel({ children }: { children: ReactNode }) {
  const supabase = criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?voltar=/painel");
  const { data } = await supabase.from("perfis").select("papel").eq("id", user.id).maybeSingle();
  if (!["treinador", "gerente", "admin"].includes(data?.papel ?? "")) redirect("/treinos");
  return <>{children}</>;
}
