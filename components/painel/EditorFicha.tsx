"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORIAS, EXERCICIOS, categoriaDe } from "@/data/exercicios";
import { FREQUENCIAS, OBJETIVOS, PONTOS_FRACOS, type Freq, type ObjetivoId } from "@/data/treinos";
import type { Dia, ItemDia } from "@/components/DiasFicha";
import { FICHA_VAZIA, apagarFicha, lerFicha, nomeOuEmail, salvarFicha, type FichaTreinador, type Perfil } from "@/lib/equipe";
import { criarCliente } from "@/lib/supabase/client";
import { montarFicha } from "@/lib/treino";
import type { GrupoMuscular } from "@/lib/types";

const INPUT = "mt-1 min-h-[48px] w-full bg-fundo px-3 text-base";
const ROTULO = "block text-base font-semibold";
const BTN_ICONE =
  "min-h-[44px] min-w-[44px] border-2 border-linha text-lg font-bold transition-transform duration-100 ease-out active:scale-[0.95] hover:border-tinta disabled:opacity-30";
const BTN_TEXTO = "min-h-[48px] font-bold underline underline-offset-4";
const DIAS_SEMANA = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
const NOVO_ITEM: ItemDia = { id: "supino-reto", series: "3 × 10 a 12 repetições", descanso: "60 s", obs: "" };

// Exercícios agrupados por categoria para o seletor.
const GRUPOS_SELECT = CATEGORIAS.filter((c) => c !== "Todos").map((c) => ({
  categoria: c,
  exercicios: EXERCICIOS.filter((e) => categoriaDe(e.grupo_primario) === c),
}));

function mover<T>(lista: T[], de: number, para: number): T[] {
  if (para < 0 || para >= lista.length) return lista;
  const nova = [...lista];
  const [item] = nova.splice(de, 1);
  nova.splice(para, 0, item);
  return nova;
}

export function EditorFicha({ alunoId }: { alunoId: string }) {
  const [aluno, setAluno] = useState<Perfil | null>(null);
  const [ficha, setFicha] = useState<FichaTreinador>(FICHA_VAZIA);
  const [existe, setExiste] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mudou, setMudou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [status, setStatus] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  // Gerador de ponto de partida
  const [freq, setFreq] = useState<Freq>(3);
  const [obj, setObj] = useState<ObjetivoId>("saude");
  const [grupo, setGrupo] = useState<GrupoMuscular>("peitoral");

  useEffect(() => {
    (async () => {
      const supabase = criarCliente();
      const [p, f] = await Promise.all([
        supabase.from("perfis").select("*").eq("id", alunoId).maybeSingle(),
        supabase.from("fichas").select("conteudo").eq("aluno_id", alunoId).maybeSingle(),
      ]);
      setAluno((p.data as Perfil | null) ?? null);
      if (f.data) {
        setFicha(lerFicha(f.data.conteudo));
        setExiste(true);
      }
      setCarregando(false);
    })();
  }, [alunoId]);

  // Avisa antes de sair com alterações não salvas.
  useEffect(() => {
    if (!mudou) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [mudou]);

  const alterar = (nova: FichaTreinador) => {
    setFicha(nova);
    setMudou(true);
    setStatus(null);
  };
  const alterarDia = (i: number, d: Partial<Dia>) => alterar({ ...ficha, dias: ficha.dias.map((x, k) => (k === i ? { ...x, ...d } : x)) });
  const alterarItem = (i: number, n: number, it: Partial<ItemDia>) =>
    alterarDia(i, { itens: ficha.dias[i].itens.map((x, k) => (k === n ? { ...x, ...it } : x)) });

  function gerar() {
    if (ficha.dias.length > 0 && !window.confirm("Isso substitui os dias e exercícios atuais pela ficha automática. Continuar?")) return;
    const r = montarFicha(freq, obj, grupo, "novo");
    if ("erro" in r) return setStatus({ tipo: "erro", texto: r.erro });
    alterar({
      titulo: ficha.titulo || r.ficha.titulo,
      observacoes: ficha.observacoes || r.ficha.justificativa,
      dias: r.ficha.dias.map((d) => ({ dia: d.dia, titulo: d.titulo, itens: d.itens.map((i) => ({ ...i, obs: "" })) })),
    });
  }

  function adicionarDia() {
    const usados = new Set(ficha.dias.map((d) => d.dia));
    const dia = DIAS_SEMANA.find((d) => !usados.has(d)) ?? `Dia ${ficha.dias.length + 1}`;
    alterar({ ...ficha, dias: [...ficha.dias, { dia, titulo: "", itens: [{ ...NOVO_ITEM }] }] });
  }

  async function salvar() {
    const limpa: FichaTreinador = {
      titulo: ficha.titulo.trim(),
      observacoes: ficha.observacoes.trim(),
      dias: ficha.dias
        .map((d) => ({ ...d, dia: d.dia.trim(), titulo: d.titulo.trim(), itens: d.itens.filter((i) => EXERCICIOS.some((e) => e.id === i.id)) }))
        .filter((d) => d.itens.length > 0),
    };
    if (limpa.dias.length === 0) return setStatus({ tipo: "erro", texto: "Adicione pelo menos um dia com um exercício antes de salvar." });
    setSalvando(true);
    try {
      await salvarFicha(alunoId, limpa);
      setFicha(limpa);
      setExiste(true);
      setMudou(false);
      setStatus({ tipo: "ok", texto: "Ficha salva. O aluno já vê a nova versão na tela Treinos." });
    } catch {
      setStatus({ tipo: "erro", texto: "Não foi possível salvar. Confira a internet e tente de novo." });
    } finally {
      setSalvando(false);
    }
  }

  async function apagar() {
    if (!window.confirm("Apagar a ficha deste aluno? Ele volta a ver só a ficha automática.")) return;
    try {
      await apagarFicha(alunoId);
      setFicha(FICHA_VAZIA);
      setExiste(false);
      setMudou(false);
      setStatus({ tipo: "ok", texto: "Ficha apagada." });
    } catch {
      setStatus({ tipo: "erro", texto: "Não foi possível apagar. Tente de novo." });
    }
  }

  if (carregando) return <p className="text-lg text-suave">Carregando…</p>;
  if (!aluno)
    return (
      <div>
        <p className="text-xl">Aluno não encontrado.</p>
        <Link href="/painel" className={BTN_TEXTO}>← Voltar para a lista</Link>
      </div>
    );

  return (
    <div>
      <Link href="/painel" className={`${BTN_TEXTO} inline-flex items-center text-suave`}>← Todos os alunos</Link>
      <h1 className="mt-4 text-[clamp(2.25rem,6vw,4rem)] font-extrabold leading-[0.95] tracking-tighter">{nomeOuEmail(aluno)}</h1>
      {aluno.nome.trim() && <p className="mt-2 text-lg text-suave">{aluno.email}</p>}

      {/* Ponto de partida */}
      <div className="mt-10 border-l-4 border-primario bg-superficie p-5 md:p-6">
        <p className="text-xl font-extrabold">{existe || ficha.dias.length ? "Recomeçar da ficha automática" : "Começar pela ficha automática"}</p>
        <p className="mt-1 max-w-[60ch] text-base text-suave">Gera a divisão, os exercícios e as séries pelo objetivo. Depois é só ajustar.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className={ROTULO}>
            Frequência
            <select value={freq} onChange={(e) => setFreq(Number(e.target.value) as Freq)} className={INPUT}>
              {FREQUENCIAS.map((f) => <option key={f} value={f}>{f}x por semana</option>)}
            </select>
          </label>
          <label className={ROTULO}>
            Objetivo
            <select value={obj} onChange={(e) => setObj(e.target.value as ObjetivoId)} className={INPUT}>
              {OBJETIVOS.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
            </select>
          </label>
          {obj === "fraco" && (
            <label className={ROTULO}>
              Músculo
              <select value={grupo} onChange={(e) => setGrupo(e.target.value as GrupoMuscular)} className={INPUT}>
                {PONTOS_FRACOS.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </label>
          )}
        </div>
        <button onClick={gerar} className="btn mt-4">Gerar ficha</button>
      </div>

      {/* Dados gerais */}
      <div className="mt-10 grid max-w-3xl gap-5">
        <label className={ROTULO}>
          Nome da ficha
          <input value={ficha.titulo} onChange={(e) => alterar({ ...ficha, titulo: e.target.value })} placeholder="Ex.: Hipertrofia · fase 1" className={`${INPUT} bg-superficie`} />
        </label>
        <label className={ROTULO}>
          Observações para o aluno
          <textarea
            value={ficha.observacoes}
            onChange={(e) => alterar({ ...ficha, observacoes: e.target.value })}
            rows={4}
            placeholder="Ex.: aquecer 10 minutos na esteira antes. Usar esta ficha por 6 semanas."
            className="mt-1 w-full bg-superficie p-3 text-base"
          />
        </label>
      </div>

      {/* Dias */}
      <div className="mt-10 grid gap-6">
        {ficha.dias.map((d, i) => (
          <section key={i} className="bg-superficie p-4 md:p-6" aria-label={`Dia ${i + 1}`}>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className={ROTULO}>
                Dia
                <input value={d.dia} onChange={(e) => alterarDia(i, { dia: e.target.value })} className={INPUT} />
              </label>
              <label className={ROTULO}>
                Treino
                <input value={d.titulo} onChange={(e) => alterarDia(i, { titulo: e.target.value })} placeholder="Ex.: Treino A · Peito e tríceps" className={INPUT} />
              </label>
              <div className="flex gap-2">
                <button onClick={() => alterar({ ...ficha, dias: mover(ficha.dias, i, i - 1) })} disabled={i === 0} aria-label="Subir dia" className={BTN_ICONE}>↑</button>
                <button onClick={() => alterar({ ...ficha, dias: mover(ficha.dias, i, i + 1) })} disabled={i === ficha.dias.length - 1} aria-label="Descer dia" className={BTN_ICONE}>↓</button>
                <button
                  onClick={() => window.confirm(`Remover ${d.dia || "este dia"}?`) && alterar({ ...ficha, dias: ficha.dias.filter((_, k) => k !== i) })}
                  aria-label="Remover dia"
                  className={`${BTN_ICONE} hover:border-primario hover:text-primario`}
                >
                  ✕
                </button>
              </div>
            </div>

            <ol className="mt-4 divide-y divide-linha border-y border-linha">
              {d.itens.map((it, n) => (
                <li key={n} className="grid gap-3 py-4 md:grid-cols-[2rem_minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_auto] md:items-end">
                  <span className="text-2xl font-extrabold tabular-nums md:pb-2">{n + 1}</span>
                  <label className={ROTULO}>
                    Exercício
                    <select value={it.id} onChange={(e) => alterarItem(i, n, { id: e.target.value })} className={INPUT}>
                      {GRUPOS_SELECT.map((g) => (
                        <optgroup key={g.categoria} label={g.categoria}>
                          {g.exercicios.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                  <label className={ROTULO}>
                    Séries e repetições
                    <input value={it.series} onChange={(e) => alterarItem(i, n, { series: e.target.value })} placeholder="3 × 10 repetições" className={INPUT} />
                  </label>
                  <label className={ROTULO}>
                    Descanso
                    <input value={it.descanso} onChange={(e) => alterarItem(i, n, { descanso: e.target.value })} placeholder="60 s" className={INPUT} />
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => alterarDia(i, { itens: mover(d.itens, n, n - 1) })} disabled={n === 0} aria-label="Subir exercício" className={BTN_ICONE}>↑</button>
                    <button onClick={() => alterarDia(i, { itens: mover(d.itens, n, n + 1) })} disabled={n === d.itens.length - 1} aria-label="Descer exercício" className={BTN_ICONE}>↓</button>
                    <button onClick={() => alterarDia(i, { itens: d.itens.filter((_, k) => k !== n) })} aria-label="Remover exercício" className={`${BTN_ICONE} hover:border-primario hover:text-primario`}>✕</button>
                  </div>
                  <label className={`${ROTULO} md:col-start-2 md:col-end-6`}>
                    Observação <span className="font-normal text-suave">(opcional)</span>
                    <input value={it.obs ?? ""} onChange={(e) => alterarItem(i, n, { obs: e.target.value })} placeholder="Ex.: descer em 3 segundos, carga de 20 kg" className={INPUT} />
                  </label>
                </li>
              ))}
            </ol>
            <button onClick={() => alterarDia(i, { itens: [...d.itens, { ...NOVO_ITEM }] })} className={`${BTN_TEXTO} mt-3`}>+ Adicionar exercício</button>
          </section>
        ))}
      </div>

      <button onClick={adicionarDia} className={`${BTN_TEXTO} mt-6 text-lg`}>+ Adicionar dia</button>

      {existe && (
        <div className="mt-12">
          <button onClick={apagar} className={`${BTN_TEXTO} text-primario`}>Apagar a ficha deste aluno</button>
        </div>
      )}

      {/* Barra de salvar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-linha bg-fundo pb-[env(safe-area-inset-bottom,0px)]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 md:px-8">
          <p role="status" className={`min-w-0 flex-1 text-base font-semibold ${status?.tipo === "erro" ? "text-primario" : status ? "" : "text-suave"}`}>
            {status?.texto ?? (mudou ? "Alterações não salvas" : existe ? "Tudo salvo" : "Ficha ainda não criada")}
          </p>
          <button onClick={salvar} disabled={salvando || !mudou} className="btn disabled:opacity-40">
            {salvando ? "Salvando…" : "Salvar ficha"}
          </button>
        </div>
      </div>
    </div>
  );
}
