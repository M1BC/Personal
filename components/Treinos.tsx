"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CICLOS, FREQUENCIAS, NIVEIS, OBJETIVOS, PONTOS_FRACOS, type Ciclo, type Freq, type Nivel, type ObjetivoTela } from "@/data/treinos";
import { prepararAudio, tocarBipe } from "@/lib/som";
import { montarFicha } from "@/lib/treino";
import type { GrupoMuscular } from "@/lib/types";
import { DiasFicha } from "./DiasFicha";
import { FichaDoTreinador } from "./FichaDoTreinador";
import { MeuTreino } from "./MeuTreino";
import { ModalExercicio } from "./ModalExercicio";

const OPCAO = "min-h-[56px] px-5 py-3 text-left transition-transform duration-100 ease-out active:scale-[0.97]";
const CHIP = "min-h-[48px] border-2 border-tinta px-5 py-2 font-bold transition-transform duration-100 ease-out active:scale-[0.97]";
const CHAVE_SOM = "treino:som";

export function Treinos() {
  const [freq, setFreq] = useState<Freq>(3);
  const [obj, setObj] = useState<ObjetivoTela>("saude");
  const [nivel, setNivel] = useState<Nivel>("iniciante");
  const [grupo, setGrupo] = useState<GrupoMuscular>("ombros");
  const [ciclo, setCiclo] = useState<Ciclo>("novo");
  const [aberto, setAberto] = useState<string | null>(null);
  const [som, setSom] = useState(true);
  const [timerAtivo, setTimerAtivo] = useState<string | null>(null);
  const fechar = useCallback(() => setAberto(null), []);
  const r = useMemo(() => (obj === "criar" ? null : montarFicha(freq, obj, grupo, ciclo, nivel)), [freq, obj, grupo, ciclo, nivel]);

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
      <FichaDoTreinador som={som} timerAtivo={timerAtivo} onIniciarTimer={setTimerAtivo} onExplicar={setAberto} />

      <p className="text-lg font-semibold">1. Quantas vezes por semana você quer treinar?</p>
      <div role="group" aria-label="Frequência semanal" className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FREQUENCIAS.map((f) => (
          <button key={f} aria-pressed={f === freq} onClick={() => setFreq(f)} className={`${OPCAO} text-xl font-extrabold ${f === freq ? "bg-tinta text-fundo" : "bg-superficie hover:bg-corpo"}`}>
            {f}x/semana
          </button>
        ))}
      </div>
      {obj === "fraco" && freq >= 4 && (
        <p className="mt-3 max-w-[70ch] border-l-4 border-primario bg-superficie p-4 text-base" role="note">
          No Ponto Fraco, o músculo escolhido é treinado no máximo 3 vezes por semana (48 horas de descanso entre as sessões). A ficha abaixo tem 3 sessões.
        </p>
      )}

      <p className="mt-6 text-lg font-semibold">2. Qual é o seu objetivo?</p>
      <div role="group" aria-label="Objetivo" className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {OBJETIVOS.map((o) => (
          <button key={o.id} aria-pressed={o.id === obj} onClick={() => setObj(o.id)} className={`${OPCAO} ${o.id === obj ? "bg-tinta text-fundo" : "bg-superficie hover:bg-corpo"}`}>
            <span className="block text-lg font-extrabold">{o.nome}</span>
            <span className="block text-base opacity-80">{o.sub}</span>
          </button>
        ))}
      </div>

      {obj === "hipertrofia" && (
        <div className="animar mt-6">
          <p className="text-lg font-semibold">3. Qual é o seu nível?</p>
          <div role="group" aria-label="Nível de experiência" className="mt-2 grid gap-2 sm:grid-cols-3">
            {NIVEIS.map((n) => (
              <button key={n.id} aria-pressed={n.id === nivel} onClick={() => setNivel(n.id)} className={`${OPCAO} ${n.id === nivel ? "bg-tinta text-fundo" : "bg-superficie hover:bg-corpo"}`}>
                <span className="block text-lg font-extrabold">{n.nome}</span>
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
              <button key={p.id} aria-pressed={p.id === grupo} onClick={() => setGrupo(p.id)} className={`${CHIP} ${p.id === grupo ? "bg-tinta text-fundo" : "hover:bg-superficie"}`}>
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
              <button key={c.id} aria-pressed={c.id === ciclo} onClick={() => setCiclo(c.id)} className={`${OPCAO} text-lg font-extrabold ${c.id === ciclo ? "bg-tinta text-fundo" : "bg-superficie hover:bg-corpo"}`}>
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
            <h2 className="text-4xl font-extrabold leading-none tracking-tight">{r.ficha.titulo}</h2>
            <p className="mt-4 max-w-[70ch] text-xl">{r.ficha.justificativa}</p>
            <p className="mt-3 max-w-[70ch] text-base text-suave">{r.ficha.divisao}</p>

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
                <p className="mt-2 text-base text-suave">As séries, repetições e descansos também foram alterados para dar um novo estímulo.</p>
              </div>
            )}

            <button role="switch" aria-checked={som} onClick={alternarSom} className="mt-5 flex min-h-[48px] items-center gap-3 text-lg font-bold">
              <span className={`relative h-7 w-12 transition-colors duration-150 ease-out ${som ? "bg-primario" : "bg-corpo"}`}>
                <span className={`absolute top-1 h-5 w-5 bg-white transition-transform duration-150 ease-out ${som ? "translate-x-6" : "translate-x-1"}`} />
              </span>
              Som do timer de descanso: {som ? "ligado" : "desligado"}
            </button>

            <DiasFicha
              dias={r.ficha.dias}
              prefixo="auto"
              som={som}
              timerAtivo={timerAtivo}
              onIniciarTimer={setTimerAtivo}
              onExplicar={setAberto}
            />

            <ul className="mt-6 max-w-[70ch] list-disc space-y-1 pl-5 text-base text-suave">
              {r.ficha.notas.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </>
        )}
      </div>
      )}

      <p className="mt-8 max-w-[70ch] border-l-4 border-primario bg-superficie p-4 text-lg font-semibold" role="note">
        Recomendações educacionais. Consulte um educador físico para a execução correta.
      </p>

      <ModalExercicio id={aberto} onFechar={fechar} />
    </div>
  );
}
