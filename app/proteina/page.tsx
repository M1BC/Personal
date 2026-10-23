import { redirect } from "next/navigation";

// A tela de Proteína foi unificada em Refeições. Este redirecionamento mantém links antigos funcionando.
export default function Proteina() {
  redirect("/refeicoes");
}
