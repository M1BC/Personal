import { FormAcesso } from "@/components/FormAcesso";
import { TelaAcesso } from "@/components/TelaAcesso";

export const metadata = { title: "Criar conta" };

export default function Pagina() {
  return (
    <TelaAcesso titulo="Crie sua conta." texto="Seu peso, suas metas e suas refeições ficam salvos na conta e aparecem no celular e no computador.">
      <FormAcesso modo="cadastrar" />
    </TelaAcesso>
  );
}
