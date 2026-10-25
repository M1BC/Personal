"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { combina } from "@/lib/busca";
import { NOME_PAPEL, mudarPapel, nomeOuEmail, type Papel, type Perfil } from "@/lib/equipe";
import { criarCliente } from "@/lib/supabase/client";

const PAPEIS: Papel[] = ["aluno", "treinador", "admin"];
const ORDEM: Record<Papel, number> = { admin: 0, treinador: 1, aluno: 2 };

export function Equipe({ meuId }: { meuId: string }) {
  const [perfis, setPerfis] = useState<Perfil[] | null>(null);
  const [busca, setBusca] = useState("");
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  useEffect(() => {
    criarCliente()
      .from("perfis")
      .select("*")
      .then(({ data, error }) => {
        if (error) return setAviso({ tipo: "erro", texto: "Não foi possível carregar as contas." });
        setPerfis((data as Perfil[]).sort((a, b) => ORDEM[a.papel] - ORDEM[b.papel] || nomeOuEmail(a).localeCompare(nomeOuEmail(b))));
      });
  }, []);

  async function trocar(p: Perfil, papel: Papel) {
    if (papel === p.papel) return;
    if (papel === "admin" && !window.confirm(`${nomeOuEmail(p)} vai poder mudar o papel de qualquer pessoa. Confirmar?`)) return;
    try {
      await mudarPapel(p.id, papel);
      setPerfis((lista) => lista?.map((x) => (x.id === p.id ? { ...x, papel } : x)) ?? null);
      setAviso({ tipo: "ok", texto: `${nomeOuEmail(p)} agora é ${NOME_PAPEL[papel].toLowerCase()}.` });
    } catch {
      setAviso({ tipo: "erro", texto: "Não foi possível mudar o papel. Tente de novo." });
    }
  }

  const visiveis = (perfis ?? []).filter((p) => !busca.trim() || combina(`${p.nome} ${p.email}`, busca));

  return (
    <div>
      <Link href="/painel" className="inline-flex min-h-[48px] items-center font-bold text-suave underline underline-offset-4">← Painel</Link>

      <label htmlFor="busca-conta" className="mt-4 block text-lg font-semibold">Buscar conta</label>
      <input
        id="busca-conta"
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Nome ou e-mail"
        className="mt-1 min-h-[48px] w-full max-w-md bg-superficie px-4 text-lg"
      />

      <p role="status" className={`mt-4 min-h-[1.75rem] text-lg font-semibold ${aviso?.tipo === "erro" ? "text-primario" : ""}`}>{aviso?.texto}</p>
      {!perfis && !aviso && <p className="text-lg text-suave">Carregando…</p>}

      {perfis && (
        <ul className="divide-y divide-linha border-y border-linha">
          {visiveis.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="min-w-0">
                <span className="block truncate text-lg font-bold">
                  {nomeOuEmail(p)}
                  {p.id === meuId && <span className="ml-2 text-base font-semibold text-suave">(você)</span>}
                </span>
                {p.nome.trim() && <span className="block truncate text-base text-suave">{p.email}</span>}
              </span>
              {p.id === meuId ? (
                <span className="min-h-[48px] px-4 py-3 font-bold">{NOME_PAPEL[p.papel]}</span>
              ) : (
                <div role="group" aria-label={`Papel de ${nomeOuEmail(p)}`} className="flex">
                  {PAPEIS.map((papel) => (
                    <button
                      key={papel}
                      aria-pressed={p.papel === papel}
                      onClick={() => trocar(p, papel)}
                      className={`min-h-[48px] border-2 border-tinta px-3 text-base font-bold transition-transform duration-100 ease-out active:scale-[0.97] sm:px-4 [&+&]:-ml-[2px] ${
                        p.papel === papel ? "bg-tinta text-fundo" : "hover:bg-superficie"
                      }`}
                    >
                      {NOME_PAPEL[papel]}
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
          {visiveis.length === 0 && <li className="py-4 text-lg text-suave">Nenhuma conta encontrada.</li>}
        </ul>
      )}
    </div>
  );
}
