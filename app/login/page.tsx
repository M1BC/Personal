import { FormAcesso } from "@/components/FormAcesso";
import { TelaAcesso } from "@/components/TelaAcesso";

export const metadata = { title: "Entrar" };

export default function Pagina({ searchParams }: { searchParams: { erro?: string } }) {
  return (
    <TelaAcesso titulo="Entre na sua conta." texto="Seu treino, suas refeições e a ficha do seu treinador, em qualquer aparelho.">
      {searchParams.erro === "link" && (
        <p className="mb-6 text-lg font-semibold text-alerta">
          O link de confirmação expirou ou já foi usado. Entre com seu e-mail e senha.
        </p>
      )}
      <FormAcesso modo="entrar" />
    </TelaAcesso>
  );
}
