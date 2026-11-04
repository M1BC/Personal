import Link from "next/link";
import { Icone, type NomeIcone } from "@/components/Icone";
import { CAIXA, H1 } from "@/lib/layout";

const ATALHOS: { href: string; nome: string; texto: string; icone: NomeIcone }[] = [
  { href: "/treinos", nome: "Treinos", texto: "Ficha pelo seu objetivo, com séries, descanso e o motivo de cada exercício.", icone: "treinos" },
  { href: "/anatomia", nome: "Anatomia", texto: "Os músculos que cada exercício trabalha e o movimento animado.", icone: "anatomia" },
  { href: "/refeicoes", nome: "Refeições", texto: "Quanto comer em cada refeição para chegar ao seu peso meta.", icone: "refeicoes" },
  { href: "/suplementos", nome: "Suplementos", texto: "O que vale comprar dentro do seu orçamento.", icone: "suplementos" },
];

// Tela inicial: saudação, o atalho principal e as seções do app.
export default function Inicio() {
  return (
    <>
      <section className="destaque-brasa overflow-hidden">
        <div className={`${CAIXA} grid items-center gap-6 pb-12 pt-8 md:pb-20 md:pt-16`}>
          <div>
            <h1 className={H1}>
              <span className="titulo-metal">Bom treino.</span>
            </h1>
            <div className="mt-8">
              <Link href="/treinos" className="btn w-full sm:w-auto">
                Montar meu treino
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className={`${CAIXA} pb-24 pt-10 md:pt-14`}>
        <section aria-labelledby="atalhos">
          <h2 id="atalhos" className="text-3xl leading-none md:text-4xl">Atalhos</h2>
          <ul className="mt-3 grid divide-y divide-linha md:grid-cols-2 md:gap-x-12 md:divide-y-0">
            {ATALHOS.map((a) => (
              <li key={a.href}>
                <Link href={a.href} className="group flex min-h-[5.25rem] items-center gap-4 py-3">
                  <span className="placa flex h-12 w-12 shrink-0 items-center justify-center bg-corpo text-brasa transition-colors duration-100 group-hover:bg-primario group-hover:text-white">
                    <Icone nome={a.icone} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-titulo text-[1.625rem] font-extrabold leading-tight">{a.nome}</span>
                    <span className="block text-base text-suave">{a.texto}</span>
                  </span>
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-suave transition-transform duration-100 group-hover:translate-x-0.5 group-hover:text-tinta" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
