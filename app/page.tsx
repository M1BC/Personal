import Link from "next/link";
import { Icone, type NomeIcone } from "@/components/Icone";
import { QuadroHorario, StatusAcademia } from "@/components/inicio/StatusAcademia";
import { CAIXA, H1, MARCA } from "@/lib/layout";
import { criarClienteServidor } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ATALHOS: { href: string; nome: string; texto: string; icone: NomeIcone }[] = [
  { href: "/treinos", nome: "Treinos", texto: "Ficha pelo seu objetivo, com séries, descanso e o motivo de cada exercício.", icone: "treinos" },
  { href: "/anatomia", nome: "Anatomia", texto: "Os músculos que cada exercício trabalha e o movimento animado.", icone: "anatomia" },
  { href: "/refeicoes", nome: "Refeições", texto: "Quanto comer em cada refeição para chegar ao seu peso meta.", icone: "refeicoes" },
  { href: "/suplementos", nome: "Suplementos", texto: "O que vale comprar dentro do seu orçamento.", icone: "suplementos" },
];
const PAINEL = { href: "/painel", nome: "Painel do treinador", texto: "Monte e ajuste a ficha dos seus alunos.", icone: "painel" as const };

// Tela inicial: a marca em destaque, se a academia está aberta agora e os atalhos do app.
export default async function Inicio() {
  const supabase = criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nome = "";
  let equipe = false;
  let ficha: { titulo: string } | null = null;
  if (user) {
    const [{ data: perfil }, { data: registro }] = await Promise.all([
      supabase.from("perfis").select("nome, papel").eq("id", user.id).maybeSingle(),
      supabase.from("fichas").select("conteudo").eq("aluno_id", user.id).maybeSingle(),
    ]);
    nome = String(perfil?.nome ?? "").trim().split(/\s+/)[0] ?? "";
    equipe = ["treinador", "gerente", "admin"].includes(String(perfil?.papel ?? ""));
    const c = (registro?.conteudo ?? null) as { titulo?: unknown; dias?: unknown } | null;
    if (c && Array.isArray(c.dias) && c.dias.length > 0) ficha = { titulo: typeof c.titulo === "string" ? c.titulo.trim() : "" };
  }
  const atalhos = equipe ? [...ATALHOS, PAINEL] : ATALHOS;

  return (
    <>
      <section className="destaque-brasa overflow-hidden">
        <div className={`${CAIXA} grid items-center gap-6 pb-12 pt-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12 md:pb-20 md:pt-16`}>
          <div className="logo-acesa w-28 sm:w-36 md:order-2 md:w-72 lg:w-[22rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/marca/bgs-logo-512.webp" alt={MARCA.nome} width={512} height={512} className="h-auto w-full" fetchPriority="high" />
          </div>
          <div className="md:order-1">
            <h1 className={H1}>
              <span className="titulo-metal">{nome ? `Bom treino, ${nome}.` : "Bom treino."}</span>
            </h1>
            <StatusAcademia />
            <div className="mt-8">
              <Link href="/treinos" className="btn w-full sm:w-auto">
                {ficha ? "Abrir minha ficha" : "Montar meu treino"}
              </Link>
              {ficha && (
                <p className="mt-3 text-base text-suave">
                  Seu treinador montou {ficha.titulo ? <>“{ficha.titulo}”</> : "uma ficha"} para você.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className={`${CAIXA} grid gap-12 pb-24 pt-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:pt-14`}>
        <section aria-labelledby="horario">
          <h2 id="horario" className="text-3xl leading-none md:text-4xl">Horário de funcionamento</h2>
          <div className="mt-5">
            <QuadroHorario />
          </div>
        </section>

        <section aria-labelledby="atalhos">
          <h2 id="atalhos" className="text-3xl leading-none md:text-4xl">Atalhos</h2>
          <ul className="mt-3 divide-y divide-linha">
            {atalhos.map((a) => (
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
