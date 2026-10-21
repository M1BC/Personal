"use client";
import { useCallback, useState } from "react";
import { EXERCICIOS, GRUPOS } from "@/data/exercicios";
import { DICAS, OBJETIVOS, PONTOS_FRACOS, treinoDe, type ObjetivoId, type PontoFracoId } from "@/data/treinos";
import { Modal } from "./Modal";

const OPCAO = "min-h-[56px] px-5 py-3 text-left transition-transform duration-100 ease-out active:scale-[0.97]";

export function Treinos() {
  const [obj, setObj] = useState<ObjetivoId>("saude");
  const [ponto, setPonto] = useState<PontoFracoId>("pernas");
  const [aberto, setAberto] = useState<string | null>(null);
  const fechar = useCallback(() => setAberto(null), []);
  const treino = treinoDe(obj, ponto);
  const ex = aberto ? EXERCICIOS.find((e) => e.id === aberto) : null;

  return (
    <div>
      <p className="text-lg font-semibold">Qual é o seu objetivo?</p>
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
          <p className="text-lg font-semibold">Qual ponto você quer fortalecer?</p>
          <div role="group" aria-label="Ponto fraco" className="mt-2 flex flex-wrap gap-2">
            {PONTOS_FRACOS.map((p) => (
              <button key={p.id} aria-pressed={p.id === ponto} onClick={() => setPonto(p.id)} className={`min-h-[48px] border-2 border-tinta px-5 py-2 font-bold transition-transform duration-100 ease-out active:scale-[0.97] ${p.id === ponto ? "bg-tinta text-fundo" : "hover:bg-superficie"}`}>
                {p.nome}
              </button>
            ))}
          </div>
          <p className="mt-4 max-w-[62ch] border-l-4 border-primario bg-superficie p-4 text-base" role="note">
            <strong>Este app não faz reabilitação.</strong> Se você tem lesão ou dor, procure um fisioterapeuta ou médico antes de
            treinar. Estes exercícios são de fortalecimento geral.
          </p>
        </div>
      )}

      <div key={`${obj}-${ponto}`} className="animar mt-10" aria-live="polite">
        <h2 className="text-4xl font-extrabold leading-none tracking-tight">{treino.titulo}</h2>
        <p className="mt-3 max-w-[62ch] text-xl">{treino.resumo}</p>
        {treino.nota && <p className="mt-2 max-w-[62ch] text-base text-suave">{treino.nota}</p>}

        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {treino.itens.map((it, n) => {
            const e = EXERCICIOS.find((x) => x.id === it.id);
            if (!e) return null;
            return (
              <li key={it.id} className="flex items-start gap-4 bg-superficie p-5">
                <span className="w-8 text-4xl font-extrabold tabular-nums">{n + 1}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl font-extrabold leading-tight">{e.nome}</h3>
                  <p className="mt-1 text-lg font-semibold">{it.series}</p>
                  <p className="text-base text-suave">Descanso: {it.descanso}</p>
                  <p className="mt-2 text-base">{it.porque}</p>
                </div>
                <button onClick={() => setAberto(it.id)} aria-label={`Entender ${e.nome}`} className="min-h-[48px] min-w-[48px] border-2 border-tinta text-xl font-bold active:scale-[0.95] hover:bg-tinta hover:text-fundo">
                  ?
                </button>
              </li>
            );
          })}
        </ol>

        <ul className="mt-6 max-w-[70ch] list-disc space-y-1 pl-5 text-base text-suave">
          {DICAS.map((d) => <li key={d}>{d}</li>)}
          <li>Séries, repetições e descanso seguem as faixas do ACSM para adultos saudáveis (2 a 4 séries, 8 a 12 repetições para força).</li>
        </ul>
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
