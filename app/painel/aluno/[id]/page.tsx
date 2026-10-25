import { EditorFicha } from "@/components/painel/EditorFicha";
import { CAIXA } from "@/lib/layout";

export const metadata = { title: "Ficha do aluno | Treino & Nutrição Consciente" };

export default function Pagina({ params }: { params: { id: string } }) {
  return (
    <section className={`${CAIXA} pb-40 pt-10 md:pt-14`}>
      <EditorFicha alunoId={params.id} />
    </section>
  );
}
