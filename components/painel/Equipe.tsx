"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { combina } from "@/lib/busca";
import {
  NOME_PAPEL, listarUnidades, mudarPapel, nomeOuEmail, nomeUnidade, transferir, type Papel, type Perfil, type Unidade,
} from "@/lib/equipe";
import { criarCliente } from "@/lib/supabase/client";

const ORDEM: Record<Papel, number> = { admin: 0, gerente: 1, treinador: 2, aluno: 3 };
const SEM = "sem"; // filtro "Sem unidade"

export function Equipe({ meuId, admin }: { meuId: string; admin: boolean }) {
  const [perfis, setPerfis] = useState<Perfil[] | null>(null);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  // Admin escolhe qualquer papel; gerente só alterna entre aluno e treinador.
  const papeis: Papel[] = admin ? ["aluno", "treinador", "gerente", "admin"] : ["aluno", "treinador"];
  const porId = useMemo(() => new Map(unidades.map((u) => [u.id, u])), [unidades]);

  useEffect(() => {
    listarUnidades().then(setUnidades).catch(() => {});
    criarCliente()
      .from("perfis")
      .select("*")
      .then(({ data, error }) => {
        if (error) return setAviso({ tipo: "erro", texto: "Não foi possível carregar as contas." });
        setPerfis((data as Perfil[]).sort((a, b) => ORDEM[a.papel] - ORDEM[b.papel] || nomeOuEmail(a).localeCompare(nomeOuEmail(b))));
      });
  }, []);

  const podeMexer = (p: Perfil) => p.id !== meuId && (admin || p.papel === "aluno" || p.papel === "treinador");

  async function trocarPapel(p: Perfil, papel: Papel) {
    if (papel === p.papel) return;
    if (papel === "admin" && !window.confirm(`${nomeOuEmail(p)} vai poder mudar o papel e a unidade de qualquer pessoa. Confirmar?`)) return;
    try {
      await mudarPapel(p.id, papel);
      setPerfis((lista) => lista?.map((x) => (x.id === p.id ? { ...x, papel } : x)) ?? null);
      setAviso({ tipo: "ok", texto: `${nomeOuEmail(p)} agora é ${NOME_PAPEL[papel].toLowerCase()}.` });
    } catch {
      setAviso({ tipo: "erro", texto: "Não foi possível mudar o papel. Tente de novo." });
    }
  }

  async function trocarUnidade(p: Perfil, valor: string) {
    const nova = valor || null;
    if (nova === p.unidade_id) return;
    const destino = nova ? porId.get(nova) : null;
    if (!admin && !window.confirm(`Transferir ${nomeOuEmail(p)} para ${nomeUnidade(destino)}? Depois disso ele sai da sua lista.`)) return;
    try {
      await transferir(p.id, nova);
      // O gerente deixa de ver quem foi para outra unidade.
      setPerfis((lista) => (admin ? lista?.map((x) => (x.id === p.id ? { ...x, unidade_id: nova } : x)) : lista?.filter((x) => x.id !== p.id)) ?? null);
      setAviso({ tipo: "ok", texto: `${nomeOuEmail(p)} agora está em ${nomeUnidade(destino)}.` });
    } catch {
      setAviso({ tipo: "erro", texto: "Não foi possível trocar a unidade. Tente de novo." });
    }
  }

  const visiveis = (perfis ?? []).filter(
    (p) =>
      (!busca.trim() || combina(`${p.nome} ${p.email}`, busca)) &&
      (filtro === "todas" || (filtro === SEM ? !p.unidade_id : p.unidade_id === filtro))
  );
  const ativas = unidades.filter((u) => u.ativa);

  return (
    <div>
      <div className="flex flex-wrap gap-x-8">
        <Link href="/painel" className="inline-flex min-h-[3rem] items-center font-bold text-suave underline underline-offset-4">← Painel</Link>
        {admin && (
          <Link href="/painel/unidades" className="inline-flex min-h-[3rem] items-center font-bold underline underline-offset-4">Gerenciar unidades →</Link>
        )}
      </div>

      <div className="mt-4 grid max-w-3xl gap-4 sm:grid-cols-2">
        <label className="block text-lg font-semibold">
          Buscar conta
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Nome ou e-mail"
            className="mt-1 min-h-[3rem] w-full bg-superficie px-4 text-lg font-normal"
          />
        </label>
        {admin && (
          <label className="block text-lg font-semibold">
            Unidade
            <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="mt-1 min-h-[3rem] w-full bg-superficie px-3 text-lg font-normal">
              <option value="todas">Todas as unidades</option>
              {unidades.map((u) => <option key={u.id} value={u.id}>{nomeUnidade(u)}{u.ativa ? "" : " (inativa)"}</option>)}
              <option value={SEM}>Sem unidade</option>
            </select>
          </label>
        )}
      </div>

      {admin && unidades.length === 0 && perfis && (
        <p className="mt-6 max-w-[60ch] border-l-4 border-primario bg-superficie p-4 text-lg">
          Nenhuma unidade cadastrada ainda. <Link href="/painel/unidades" className="font-bold underline underline-offset-4">Cadastre as unidades</Link> para separar alunos e treinadores por filial.
        </p>
      )}

      <p role="status" className={`mt-4 min-h-[1.75rem] text-lg font-semibold ${aviso?.tipo === "erro" ? "text-alerta" : ""}`}>{aviso?.texto}</p>
      {!perfis && !aviso && <p className="text-lg text-suave">Carregando…</p>}

      {perfis && (
        <ul className="divide-y divide-linha border-y border-linha">
          {visiveis.map((p) => (
            <li key={p.id} className="grid gap-3 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <span className="min-w-0">
                <span className="block truncate text-lg font-bold">
                  {nomeOuEmail(p)}
                  {p.id === meuId && <span className="ml-2 text-base font-semibold text-suave">(você)</span>}
                </span>
                <span className="block truncate text-base text-suave">
                  {p.nome.trim() ? `${p.email} · ` : ""}
                  {nomeUnidade(p.unidade_id ? porId.get(p.unidade_id) : null)}
                </span>
              </span>

              {podeMexer(p) ? (
                <div className="flex flex-wrap items-center gap-3">
                  {ativas.length > 0 && (
                    <select
                      aria-label={`Unidade de ${nomeOuEmail(p)}`}
                      value={p.unidade_id ?? ""}
                      onChange={(e) => trocarUnidade(p, e.target.value)}
                      className="min-h-[3rem] max-w-[16rem] bg-superficie px-3 text-base"
                    >
                      {admin && <option value="">Sem unidade</option>}
                      {!admin && !p.unidade_id && <option value="" disabled>Sem unidade</option>}
                      {ativas.map((u) => <option key={u.id} value={u.id}>{nomeUnidade(u)}</option>)}
                    </select>
                  )}
                  <div role="group" aria-label={`Papel de ${nomeOuEmail(p)}`} className="flex flex-wrap gap-2">
                    {papeis.map((papel) => (
                      <button
                        key={papel}
                        aria-pressed={p.papel === papel}
                        onClick={() => trocarPapel(p, papel)}
                        className="chip text-base"
                      >
                        {NOME_PAPEL[papel]}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <span className="min-h-[3rem] py-3 font-bold">{NOME_PAPEL[p.papel]}</span>
              )}
            </li>
          ))}
          {visiveis.length === 0 && <li className="py-4 text-lg text-suave">Nenhuma conta encontrada.</li>}
        </ul>
      )}
    </div>
  );
}
