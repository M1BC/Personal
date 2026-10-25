"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { combina } from "@/lib/busca";
import { meuPerfil, nomeOuEmail, type Perfil } from "@/lib/equipe";
import { criarCliente } from "@/lib/supabase/client";

type Linha = Perfil & { atualizada: string | null };

const quando = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

export function ListaAlunos() {
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    meuPerfil().then((p) => setAdmin(p?.papel === "admin"));
    (async () => {
      const supabase = criarCliente();
      const [alunos, fichas] = await Promise.all([
        supabase.from("perfis").select("*").eq("papel", "aluno").order("nome"),
        supabase.from("fichas").select("aluno_id, atualizado_em"),
      ]);
      if (alunos.error || fichas.error) return setErro("Não foi possível carregar os alunos. Recarregue a página.");
      const quandoFicha = new Map((fichas.data ?? []).map((f) => [f.aluno_id as string, f.atualizado_em as string]));
      setLinhas((alunos.data as Perfil[]).map((a) => ({ ...a, atualizada: quandoFicha.get(a.id) ?? null })));
    })();
  }, []);

  const visiveis = (linhas ?? []).filter((a) => !busca.trim() || combina(`${a.nome} ${a.email}`, busca));
  const semFicha = (linhas ?? []).filter((a) => !a.atualizada).length;

  return (
    <div>
      {admin && (
        <Link href="/painel/equipe" className="mb-8 inline-flex min-h-[48px] items-center font-bold underline underline-offset-4">
          Gerenciar equipe e papéis →
        </Link>
      )}

      <label htmlFor="busca-aluno" className="block text-lg font-semibold">Buscar aluno</label>
      <input
        id="busca-aluno"
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Nome ou e-mail"
        className="mt-1 min-h-[48px] w-full max-w-md bg-superficie px-4 text-lg"
      />

      {erro && <p className="mt-6 text-lg font-semibold text-primario">{erro}</p>}
      {!linhas && !erro && <p className="mt-6 text-lg text-suave">Carregando alunos…</p>}

      {linhas && (
        <>
          <p className="mt-4 text-base text-suave" aria-live="polite">
            {linhas.length} {linhas.length === 1 ? "aluno" : "alunos"}
            {semFicha > 0 && ` · ${semFicha} sem ficha`}
          </p>
          {linhas.length === 0 ? (
            <p className="mt-6 max-w-[60ch] bg-superficie p-6 text-lg">
              Nenhum aluno cadastrado ainda. Quando os alunos criarem conta no app, eles aparecem aqui.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-linha border-y border-linha">
              {visiveis.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/painel/aluno/${a.id}`}
                    className="flex min-h-[64px] items-center justify-between gap-4 py-3 transition-colors duration-100 hover:bg-superficie"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-lg font-bold">{nomeOuEmail(a)}</span>
                      {a.nome.trim() && <span className="block truncate text-base text-suave">{a.email}</span>}
                    </span>
                    <span className={`shrink-0 text-base font-semibold ${a.atualizada ? "text-suave" : "text-primario"}`}>
                      {a.atualizada ? `Ficha de ${quando(a.atualizada)}` : "Sem ficha"}
                    </span>
                  </Link>
                </li>
              ))}
              {visiveis.length === 0 && <li className="py-4 text-lg text-suave">Nenhum aluno encontrado.</li>}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
