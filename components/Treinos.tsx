"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CICLOS, FREQUENCIAS, NIVEIS, OBJETIVOS, PONTOS_FRACOS, type Ciclo, type Freq, type Nivel, type ObjetivoTela } from "@/data/treinos";
import { prepararAudio, tocarBipe } from "@/lib/som";
import { montarFicha, type Resultado } from "@/lib/treino";
import { alternativas, trocarItem } from "@/lib/troca";
import { EXERCICIOS } from "@/data/exercicios";
import type { GrupoMuscular } from "@/lib/types";
import { DiasFicha } from "./DiasFicha";
import { MeuTreino } from "./MeuTreino";
import { Modal } from "./Modal";
import { ModalExercicio } from "./ModalExercicio";

const OPCAO = "min-h-[3.5rem] px-5 py-3 text-left";
const CHAVE_SOM = "treino:som";
const CHAVE_TROCAS = "treino:trocas";
// Trocas de exercício por ficha: { "hipertrofia-4-intermediario-novo-": { "0-2": { de, para } } }
type Trocas = Record<string, Record<string, { de: string; para: string }>>;
const nomeDe = (id: string) => EXERCICIOS.find((e) => e.id === id)?.nome ?? id;

// Aplica as trocas salvas. Só troca se a posição ainda tiver o mesmo exercício original (a ficha pode ter mudado).
function aplicarTrocas(r: Resultado | null, minhas: Trocas[string] | undefined): Resultado | null {
  if (!r || "erro" in r || !minhas) return r;
  const dias = r.ficha.dias.map((d, i) => ({
    ...d,
    itens: d.itens.map((it, n) => {
      const t = minhas[`${i}-${n}`];
      return t && t.de === it.id ? trocarItem(it, t.para) : it;
    }),
  }));
  return { ficha: { ...r.ficha, dias } };
}

export function Treinos() {
  const [freq, setFreq] = useState<Freq>(3);
  const [obj, setObj] = useState<ObjetivoTela>("hipertrofia");
  const [nivel, setNivel] = useState<Nivel>("intermediario");
  const [grupo, setGrupo] = useState<GrupoMuscular>("ombros");
  const [ciclo, setCiclo] = useState<Ciclo>("novo");
  const [aberto, setAberto] = useState<string | null>(null);
  const [som, setSom] = useState(true);
  const [timerAtivo, setTimerAtivo] = useState<string | null>(null);
  const fechar = useCallback(() => setAberto(null), []);
  const base = useMemo(() => (obj === "criar" ? null : montarFicha(freq, obj, grupo, ciclo, nivel)), [freq, obj, grupo, ciclo, nivel]);
  const chaveFicha = `${obj}-${freq}-${nivel}-${ciclo}-${obj === "fraco" ? grupo : ""}`;
  const [trocas, setTrocas] = useState<Trocas>({});
  const [trocando, setTrocando] = useState<{ dia: number; item: number } | null>(null);
  const fecharTroca = useCallback(() => setTrocando(null), []);
  const r = useMemo(() => aplicarTrocas(base, trocas[chaveFicha]), [base, trocas, chaveFicha]);

  // Trocas de exercício ficam salvas neste aparelho.
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_TROCAS);
      if (salvo) setTrocas(JSON.parse(salvo));
    } catch {
      // Sem armazenamento: as trocas valem só nesta sessão.
    }
  }, []);

  const escolherTroca = (novoId: string) => {
    if (!trocando || !base || "erro" in base) return;
    const pos = `${trocando.dia}-${trocando.item}`;
    const originalId = base.ficha.dias[trocando.dia].itens[trocando.item].id;
    const daFicha = { ...(trocas[chaveFicha] ?? {}) };
    if (novoId === originalId) delete daFicha[pos];
    else daFicha[pos] = { de: originalId, para: novoId };
    const novas = { ...trocas, [chaveFicha]: daFicha };
    setTrocas(novas);
    try {
      localStorage.setItem(CHAVE_TROCAS, JSON.stringify(novas));
    } catch {
      // Sem armazenamento: vale só nesta sessão.
    }
    setTrocando(null);
  };

  const originalDe = (dia: number, item: number) => {
    const t = trocas[chaveFicha]?.[`${dia}-${item}`];
    if (!t || !base || "erro" in base || base.ficha.dias[dia]?.itens[item]?.id !== t.de) return undefined;
    return nomeDe(t.de);
  };

  // Opções da janela de troca: equivalentes que ainda não estão no dia, com o original no topo se já foi trocado.
  const opcoesTroca = (() => {
    if (!trocando || !r || "erro" in r || !base || "erro" in base) return null;
    const dia = r.ficha.dias[trocando.dia];
    const atual = dia.itens[trocando.item];
    const originalId = base.ficha.dias[trocando.dia].itens[trocando.item].id;
    const noDia = dia.itens.map((x) => x.id);
    const lista = alternativas(atual.id, noDia);
    const ordenada = originalId !== atual.id ? [...lista.filter((e) => e.id === originalId), ...lista.filter((e) => e.id !== originalId)] : lista;
    return { atual, originalId, lista: ordenada };
  })();

  // Lembra se o usuário silenciou o timer.
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_SOM);
      if (salvo !== null) setSom(salvo === "1");
    } catch {
      // Sem armazenamento: o som fica ligado.
    }
  }, []);

  // Ao trocar de ficha, nenhum timer fica em uso.
  useEffect(() => {
    setTimerAtivo(null);
  }, [freq, obj, grupo, ciclo, nivel]);

  const alternarSom = () => {
    const novo = !som;
    setSom(novo);
    try {
      localStorage.setItem(CHAVE_SOM, novo ? "1" : "0");
    } catch {
      // Sem armazenamento: vale só nesta sessão.
    }
    if (novo) {
      prepararAudio(); // dentro do clique
      tocarBipe(); // toca uma vez para você ouvir o volume
    }
  };

  return (
    <div>

      <p className="text-lg font-semibold">1. Quantas vezes por semana você quer treinar?</p>
      <div role="group" aria-label="Frequência semanal" className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FREQUENCIAS.map((f) => (
          <button key={f} aria-pressed={f === freq} onClick={() => setFreq(f)} className={`${OPCAO} opcao font-titulo text-2xl font-extrabold`}>
            {f}x/semana
          </button>
        ))}
      </div>
      {obj === "fraco" && freq >= 4 && (
        <p className="mt-3 max-w-[70ch] border-l-4 border-primario bg-superficie p-4 text-base" role="note">
          No Ponto Fraco são no máximo 3 treinos por semana, com 48 horas de descanso entre eles.
        </p>
      )}

      <p className="mt-6 text-lg font-semibold">2. Qual é o seu objetivo?</p>
      <div role="group" aria-label="Objetivo" className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {OBJETIVOS.map((o) => (
          <button key={o.id} aria-pressed={o.id === obj} onClick={() => setObj(o.id)} className={`${OPCAO} opcao`}>
            <span className="block font-titulo text-2xl font-extrabold leading-tight">{o.nome}</span>
            <span className="block text-base opacity-80">{o.sub}</span>
          </button>
        ))}
      </div>

      {obj === "hipertrofia" && (
        <div className="animar mt-6">
          <p className="text-lg font-semibold">3. Qual é o seu nível?</p>
          <div role="group" aria-label="Nível de experiência" className="mt-2 grid gap-2 sm:grid-cols-3">
            {NIVEIS.map((n) => (
              <button key={n.id} aria-pressed={n.id === nivel} onClick={() => setNivel(n.id)} className={`${OPCAO} opcao`}>
                <span className="block font-titulo text-2xl font-extrabold leading-tight">{n.nome}</span>
                <span className="block text-base opacity-80">{n.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {obj === "fraco" && (
        <div className="animar mt-6">
          <p className="text-lg font-semibold">3. Qual músculo você quer fortalecer?</p>
          <p className="text-base text-suave">A ficha treina esse músculo e também os músculos que dão apoio a ele.</p>
          <div role="group" aria-label="Ponto fraco" className="mt-2 flex flex-wrap gap-2">
            {PONTOS_FRACOS.map((p) => (
              <button key={p.id} aria-pressed={p.id === grupo} onClick={() => setGrupo(p.id)} className="chip">
                {p.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {obj !== "criar" && (
        <>
          <p className="mt-6 text-lg font-semibold">Há quanto tempo você está usando esta ficha?</p>
          <div role="group" aria-label="Tempo de uso da ficha" className="mt-2 grid gap-2 sm:grid-cols-3">
            {CICLOS.map((c) => (
              <button key={c.id} aria-pressed={c.id === ciclo} onClick={() => setCiclo(c.id)} className={`${OPCAO} opcao text-lg font-bold`}>
                {c.nome}
              </button>
            ))}
          </div>
        </>
      )}

      {obj === "criar" && (
        <MeuTreino freq={freq} som={som} timerAtivo={timerAtivo} onIniciarTimer={setTimerAtivo} onExplicar={setAberto} />
      )}

      {r && (
      <div key={`${freq}-${obj}-${grupo}-${ciclo}-${nivel}`} className="animar mt-10" aria-live="polite">
        {"erro" in r ? (
          <p className="max-w-[62ch] border-l-4 border-primario bg-superficie p-6 text-xl">{r.erro}</p>
        ) : (
          <>
            {r.ficha.avisoCiclo && (
              <p className={`mb-6 max-w-[70ch] bg-superficie p-5 text-lg ${r.ficha.variada ? "border-l-4 border-primario font-semibold" : "border-l-4 border-linha"}`} role="note">
                {r.ficha.avisoCiclo}
              </p>
            )}
            <h2 className="text-4xl font-extrabold leading-none">{r.ficha.titulo}</h2>
            <p className="mt-4 max-w-[70ch] text-xl">{r.ficha.divisao}</p>
            <p className="mt-2 max-w-[70ch] text-base text-suave">{r.ficha.justificativa}</p>

            {r.ficha.variada && (
              <div className="mt-4 max-w-[70ch]">
                <p className="text-lg font-semibold">O que mudou nesta ficha</p>
                {r.ficha.trocas.length > 0 ? (
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-base">
                    {r.ficha.trocas.map((t, i) => (
                      <li key={i}>
                        {t.dia}: {t.de} → <strong>{t.para}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-base text-suave">Neste caso não há troca de exercício possível: a variação está nas séries, repetições e descansos.</p>
                )}
                
              </div>
            )}

            <button role="switch" aria-checked={som} onClick={alternarSom} className="mt-5 flex min-h-[3rem] items-center gap-3 text-left text-lg font-bold">
              <span className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-150 ease-out ${som ? "border-primario bg-primario" : "border-linha bg-corpo"}`}>
                <span className={`absolute left-0 top-[calc(0.25rem-1px)] h-5 w-5 rounded-full shadow transition-[transform,background-color] duration-150 ease-out ${som ? "translate-x-[calc(1.5625rem-2px)] bg-white" : "translate-x-[0.1875rem] bg-suave"}`} />
              </span>
              Som do timer de descanso: {som ? "ligado" : "desligado"}
            </button>

            {r.ficha.volume && (
              <div className="mt-6 max-w-3xl">
                <p className="text-lg font-semibold">Séries diretas por semana</p>
                <p className="text-base text-suave">Supinos também contam para tríceps e ombros; remadas e puxadas, para bíceps.</p>
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
                  {r.ficha.volume.map((v) => (
                    <div key={v.musculo} className="flex items-baseline justify-between gap-3 border-b border-linha py-1.5">
                      <dt className="text-base">{v.musculo}</dt>
                      <dd className="text-base font-bold tabular-nums">{v.series}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <DiasFicha
              dias={r.ficha.dias}
              prefixo="auto"
              som={som}
              timerAtivo={timerAtivo}
              onIniciarTimer={setTimerAtivo}
              onExplicar={setAberto}
              onTrocar={(dia, item) => setTrocando({ dia, item })}
              original={originalDe}
            />

            <ul className="mt-6 max-w-[70ch] list-disc space-y-1 pl-5 text-base text-suave">
              {r.ficha.notas.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </>
        )}
      </div>
      )}

      <ModalExercicio id={aberto} onFechar={fechar} />
      <Modal aberto={!!opcoesTroca} titulo={opcoesTroca ? `Trocar ${nomeDe(opcoesTroca.atual.id).toLowerCase()}` : ""} onFechar={fecharTroca}>
        {opcoesTroca && (
          <>
            <p className="mt-2 text-base text-suave">Mesmo músculo e mesmo tipo de movimento. As séries, repetições e descanso continuam os mesmos.</p>
            <ul className="mt-4 grid gap-2">
              {opcoesTroca.lista.map((e) => (
                <li key={e.id}>
                  <button onClick={() => escolherTroca(e.id)} className="opcao w-full px-4 py-3 text-left">
                    <span className="block text-lg font-bold leading-tight">
                      {e.nome}
                      {e.id === opcoesTroca.originalId && <span className="ml-2 text-base font-semibold text-brasa">Original</span>}
                    </span>
                    <span className="block text-base text-suave">{e.equipamento}</span>
                  </button>
                </li>
              ))}
            </ul>
            {opcoesTroca.lista.length === 0 && <p className="mt-4 text-base">Os exercícios equivalentes já estão neste dia.</p>}
          </>
        )}
      </Modal>
    </div>
  );
}
