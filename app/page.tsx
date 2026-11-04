import Link from "next/link";
import { Icone, type NomeIcone } from "@/components/Icone";
import { CAIXA, H1 } from "@/lib/layout";
import { criarClienteServidor } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ATALHOS: { href: string; nome: string; texto: string; icone: NomeIcone }[] = [
  { href: "/treinos", nome: "Treinos", texto: "Ficha pelo seu objetivo, com séries, descanso e o motivo de cada exercício.", icone: "treinos" },
  { href: "/anatomia", nome: "Anatomia", texto: "Os músculos que cada exercício trabalha e o movimento animado.", icone: "anatomia" },
  { href: "/refeicoes", nome: "Refeições", texto: "Quanto comer em cada refeição para chegar ao seu peso meta.", icone: "refeicoes" },
  { href: "/suplementos", nome: "Suplementos", texto: "O que vale comprar dentro do seu orçamento.", icone: "suplementos" },
];
const PAINEL = { href: "/painel", nome: "Painel do treinador", texto: "Monte e ajuste a ficha dos seus alunos.", icone: "painel" as const };

// Tela inicial: saudação, a data de hoje, o atalho principal e as seções do app.
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

  const data = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const hoje = data.charAt(0).toUpperCase() + data.slice(1);

  return (
    <div className={`${CAIXA} pb-24 pt-10 md:pt-16`}>
      <section>
        <p className="text-base text-suave">{hoje}</p>
        <h1 className={`${H1} mt-1`}>{nome ? `Bom treino, ${nome}.` : "Bom treino."}</h1>
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
      </section>

      <section aria-labelledby="atalhos" className="mt-14 md:mt-20">
        <h2 id="atalhos" className="text-sm font-medium text-suave">Seções</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {atalhos.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className="group flex h-full min-h-[5.25rem] items-center gap-4 rounded-xl border border-linha bg-superficie p-4 transition-colors duration-100 hover:border-suave/50 md:p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-corpo text-primario">
                  <Icone nome={a.icone} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-semibold leading-tight">{a.nome}</span>
                  <span className="mt-0.5 block text-base text-suave">{a.texto}</span>
                </span>
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-suave transition-transform duration-100 group-hover:translate-x-0.5 group-hover:text-tinta" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
