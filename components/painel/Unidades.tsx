"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { criarUnidade, editarUnidade, listarUnidades, type Unidade } from "@/lib/equipe";

const INPUT = "mt-1 min-h-[48px] w-full bg-superficie px-3 text-base font-normal";

export function Unidades() {
  const [lista, setLista] = useState<Unidade[] | null>(null);
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState({ nome: "", cidade: "" });
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const recarregar = () => listarUnidades().then(setLista).catch(() => setAviso({ tipo: "erro", texto: "Não foi possível carregar as unidades." }));
  useEffect(() => {
    recarregar();
  }, []);

  async function adicionar(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return setAviso({ tipo: "erro", texto: "Digite o nome da unidade." });
    try {
      await criarUnidade(nome, cidade);
      setAviso({ tipo: "ok", texto: `Unidade ${nome.trim()} cadastrada.` });
      setNome("");
      setCidade("");
      recarregar();
    } catch {
      setAviso({ tipo: "erro", texto: "Não foi possível cadastrar. Tente de novo." });
    }
  }

  async function salvarEdicao(u: Unidade) {
    if (!rascunho.nome.trim()) return setAviso({ tipo: "erro", texto: "O nome não pode ficar vazio." });
    try {
      await editarUnidade(u.id, { nome: rascunho.nome.trim(), cidade: rascunho.cidade.trim() });
      setEditando(null);
      setAviso({ tipo: "ok", texto: "Unidade atualizada." });
      recarregar();
    } catch {
      setAviso({ tipo: "erro", texto: "Não foi possível salvar. Tente de novo." });
    }
  }

  async function alternar(u: Unidade) {
    if (u.ativa && !window.confirm(`Desativar ${u.nome}? Ela some da lista do cadastro, mas quem já está nela continua.`)) return;
    try {
      await editarUnidade(u.id, { ativa: !u.ativa });
      recarregar();
    } catch {
      setAviso({ tipo: "erro", texto: "Não foi possível mudar. Tente de novo." });
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-x-8">
        <Link href="/painel" className="inline-flex min-h-[48px] items-center font-bold text-suave underline underline-offset-4">← Painel</Link>
        <Link href="/painel/equipe" className="inline-flex min-h-[48px] items-center font-bold underline underline-offset-4">Equipe e papéis →</Link>
      </div>

      <form onSubmit={adicionar} className="mt-6 grid max-w-3xl gap-3 bg-superficie p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block text-base font-semibold">
          Nome da unidade
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Centro" className={`${INPUT} bg-fundo`} />
        </label>
        <label className="block text-base font-semibold">
          Cidade
          <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex.: Poços de Caldas" className={`${INPUT} bg-fundo`} />
        </label>
        <button type="submit" className="btn">Adicionar</button>
      </form>

      <p role="status" className={`mt-4 min-h-[1.75rem] text-lg font-semibold ${aviso?.tipo === "erro" ? "text-primario" : ""}`}>{aviso?.texto}</p>
      {!lista && !aviso && <p className="text-lg text-suave">Carregando…</p>}
      {lista && lista.length === 0 && <p className="text-lg text-suave">Nenhuma unidade ainda. Cadastre a primeira acima.</p>}

      {lista && lista.length > 0 && (
        <ul className="max-w-3xl divide-y divide-linha border-y border-linha">
          {lista.map((u) => (
            <li key={u.id} className="py-4">
              {editando === u.id ? (
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <label className="block text-base font-semibold">
                    Nome
                    <input value={rascunho.nome} onChange={(e) => setRascunho({ ...rascunho, nome: e.target.value })} className={INPUT} />
                  </label>
                  <label className="block text-base font-semibold">
                    Cidade
                    <input value={rascunho.cidade} onChange={(e) => setRascunho({ ...rascunho, cidade: e.target.value })} className={INPUT} />
                  </label>
                  <div className="flex gap-4">
                    <button onClick={() => salvarEdicao(u)} className="btn">Salvar</button>
                    <button onClick={() => setEditando(null)} className="min-h-[48px] font-bold underline underline-offset-4">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className={u.ativa ? "" : "opacity-60"}>
                    <span className="block text-lg font-bold">{u.nome}{!u.ativa && " (inativa)"}</span>
                    {u.cidade && <span className="block text-base text-suave">{u.cidade}</span>}
                  </span>
                  <span className="flex gap-5">
                    <button
                      onClick={() => {
                        setEditando(u.id);
                        setRascunho({ nome: u.nome, cidade: u.cidade });
                      }}
                      className="min-h-[48px] font-bold underline underline-offset-4"
                    >
                      Editar
                    </button>
                    <button onClick={() => alternar(u)} className={`min-h-[48px] font-bold underline underline-offset-4 ${u.ativa ? "text-primario" : ""}`}>
                      {u.ativa ? "Desativar" : "Reativar"}
                    </button>
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
