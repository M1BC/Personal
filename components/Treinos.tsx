"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EXERCICIOS, GRUPOS } from "@/data/exercicios";
import { FREQUENCIAS, OBJETIVOS, PONTOS_FRACOS, type Freq, type ObjetivoId } from "@/data/treinos";
import { useHistoricoTreinos } from "@/hooks/useHistoricoTreinos";
import { ultimoRascunho, urlAtivo, type Rascunho } from "@/lib/historico";
import { montarFicha } from "@/lib/treino";
import type { GrupoMuscular } from "@/lib/types";
import { Modal } from "./Modal";

const OPCAO = "min-h-[56px] px-5 py-3 text-left transition-transform duration-100 ease-out active:scale-[0.97]";
const CHIP = "min-h-[48px] border-2 border-tinta px-5 py-2 font-bold transition-transform duration-100 ease-out active:scale-[0.97]";
const AVISO = "mb-6 max-w-[70ch] border-l-4 border-primario bg-superficie p-4 text-lg";
const LINK = "font-bold underline underline-offset-4";

export function Treinos() {
  const [freq, setFreq] = useState<Freq>(3);
  const [obj, setObj] = useState<ObjetivoId>("saude");
  const [grupo, setGrupo] = useState<GrupoMuscular>("ombros");
  const [aberto, setAberto] = useState<string | null>(null);
  const [hoje, setHoje] = useState<number | null>(null); // 0 = segunda ... 6 = domingo (só depois de carregar)
  const [emAndamento, setEmAndamento] = useState<Rascunho | null>(null);
  const { treinouHoje } = useHistoricoTreinos();
  const fechar = useCallback(() => setAberto(null), []);
  const r = useMemo(() => montarFicha(freq, obj, grupo), [freq, obj, grupo]);
  const ex = aberto ? EXERCICIOS.find((e) => e.id === aberto) : null;

  useEffect(() => {
    setHoje((new Date().getDay() + 6) % 7);
    setEmAndamento(ultimoRascunho());
  }, []);

  // Próxima sessão da ficha a partir de hoje (se hoje não tem treino, a seguinte; no fim de semana, a de segunda).
  const dias = "erro" in r ? [] : r.ficha.dias;
  const achado = hoje === null ? -1 : dias.findIndex((d) => d.diaIdx >= hoje);
  const proximo = hoje === null || dias.length === 0 ? -1 : achado >= 0 ? achado : 0;

  return (
    <div>
      {treinouHoje && (
        <p role="status" className={AVISO}>
          Você já treinou hoje. <Link href="/historico" className={LINK}>Ver histórico?</Link>
        </p>
      )}
      {emAndamento && (
        <p role="status" className={AVISO}>
          Treino em andamento: {emAndamento.diaPlanejado} · {emAndamento.titulo}.{" "}
          <Link href={urlAtivo(emAndamento.f, emAndamento.o, emAndamento.g, emAndamento.d)} className={LINK}>Continuar treino</Link>
        </p>
      )}

      <p className="text-lg font-semibold">1. Quantas vezes por semana você quer treinar?</p>
      <div role="group" aria-label="Frequência semanal" className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FREQUENCIAS.map((f) => (
          <button key={f} aria-pressed={f === freq} onClick={() => setFreq(f)} className={`${OPCAO} text-xl font-extrabold ${f === freq ? "bg-tinta text-fundo" : "bg-superficie hover:bg-corpo"}`}>
            {f}x/semana
          </button>
        ))}
      </div>

      <p className="mt-6 text-lg font-semibold">2. Qual é o seu objetivo?</p>
      <div role="group" aria-label="Objetivo" className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {OBJETIVOS.map((o) => (
          <button key={o.id} aria-pressed={o.id === obj} onClick={() => setObj(o.id)} className={`${OPCAO} ${o.id === obj ? "bg-tinta text-fundo" : "bg-superficie hover:bg-corpo"}`}>
            <span className="block text-lg font-extrabold">{o.nome}</span>
            <span className="block text-base opacity-80">{o.sub}</span>
          </button>
        ))}
      </div>

      {obj === "fraco" && (
        <div className="animar mt-6">
          <p className="text-lg font-semibold">3. Qual músculo você quer fortalecer?</p>
          <div role="group" aria-label="Ponto fraco" className="mt-2 flex flex-wrap gap-2">
            {PONTOS_FRACOS.map((p) => (
              <button key={p.id} aria-pressed={p.id === grupo} onClick={() => setGrupo(p.id)} className={`${CHIP} ${p.id === grupo ? "bg-tinta text-fundo" : "hover:bg-superficie"}`}>
                {p.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      <div key={`${freq}-${obj}-${grupo}`} className="animar mt-10" aria-live="polite">
        {"erro" in r ? (
          <p className="max-w-[62ch] border-l-4 border-primario bg-superficie p-6 text-xl">{r.erro}</p>
        ) : (
          <>
            <h2 className="text-4xl font-extrabold leading-none tracking-tight">{r.ficha.titulo}</h2>
            <p className="mt-4 max-w-[70ch] text-xl">{r.ficha.justificativa}</p>
            <p className="mt-3 max-w-[70ch] text-base text-suave">{r.ficha.divisao}</p>
            {proximo >= 0 && (
              <Link href={urlAtivo(freq, obj, grupo, proximo)} className="btn mt-5">
                {dias[proximo].diaIdx === hoje ? "Iniciar o treino de hoje" : `Iniciar o próximo treino (${dias[proximo].dia})`}
              </Link>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {r.ficha.dias.map((d, i) => (
                <section key={i} className="bg-superficie p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-extrabold leading-tight">{d.dia}</h3>
                      <p className="text-lg text-suave">{d.titulo}</p>
                    </div>
                    <Link href={urlAtivo(freq, obj, grupo, i)} className="btn">Iniciar treino</Link>
                  </div>
                  <ol className="mt-3 divide-y divide-linha border-y border-linha">
                    {d.itens.map((it, n) => {
                      const e = EXERCICIOS.find((x) => x.id === it.id);
                      if (!e) return null;
                      return (
                        <li key={`${it.id}-${n}`} className="flex items-start gap-3 py-3">
                          <span className="w-6 text-2xl font-extrabold tabular-nums">{n + 1}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-lg font-bold leading-tight">
                              {e.nome}
                              {it.foco && <span className="ml-2 text-base font-semibold text-suave">foco</span>}
                            </p>
                            <p className="text-base">{it.series}</p>
                            <p className="text-base text-suave">Descanso: {it.descanso}</p>
                          </div>
                          <button onClick={() => setAberto(it.id)} aria-label={`Entender ${e.nome}`} className="min-h-[48px] min-w-[48px] border-2 border-tinta text-xl font-bold active:scale-[0.95] hover:bg-tinta hover:text-fundo">
                            ?
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))}
            </div>

            <ul className="mt-6 max-w-[70ch] list-disc space-y-1 pl-5 text-base text-suave">
              {r.ficha.notas.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </>
        )}
      </div>

      <p className="mt-8 max-w-[70ch] border-l-4 border-primario bg-superficie p-4 text-lg font-semibold" role="note">
        Recomendações educacionais. Consulte um educador físico para a execução correta.
      </p>

      <Modal aberto={!!ex} titulo={ex?.nome ?? ""} onFechar={fechar}>
        {ex && (
          <>
            <p className="mt-4 text-lg font-semibold">Equipamento</p>
            <p className="text-lg text-suave">{ex.equipamento}</p>
            <p className="mt-4 text-lg font-semibold">Músculo principal</p>
            <p className="text-lg text-suave">{GRUPOS[ex.grupo_primario].nome}</p>
            {ex.grupos_secundarios.length > 0 && (
              <>
                <p className="mt-4 text-lg font-semibold">Músculos Auxiliares</p>
                <p className="text-lg text-suave">{ex.grupos_secundarios.map((g) => GRUPOS[g].nome).join(", ")}</p>
              </>
            )}
            <p className="mt-4 text-lg font-semibold">Como o corpo trabalha junto</p>
            <p className="text-lg text-suave">{ex.explicacao_anatomica}</p>
          </>
        )}
      </Modal>
    </div>
  );
}
