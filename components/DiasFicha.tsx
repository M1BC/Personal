"use client";
import { EXERCICIOS } from "@/data/exercicios";
import { segundosDoDescanso } from "@/lib/tempo";
import { temAlternativa } from "@/lib/troca";
import { TimerDescanso } from "./TimerDescanso";

export interface ItemDia { id: string; series: string; descanso: string; obs?: string }
export interface Dia { dia: string; titulo: string; nota?: string; itens: ItemDia[] }

type Props = {
  dias: Dia[];
  prefixo: string; // separa os timers de fichas diferentes na mesma tela
  som: boolean;
  timerAtivo: string | null;
  onIniciarTimer: (id: string) => void;
  onExplicar: (idExercicio: string) => void;
  onTrocar?: (dia: number, item: number) => void; // abre a lista de exercícios equivalentes
  original?: (dia: number, item: number) => string | undefined; // nome do exercício original, se foi trocado
};

// Cartões de cada dia da ficha, com timer de descanso e o "?" de cada exercício.
export function DiasFicha({ dias, prefixo, som, timerAtivo, onIniciarTimer, onExplicar, onTrocar, original }: Props) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {dias.map((d, i) => (
        <section key={i} className="min-w-0 bg-superficie p-4 sm:p-6">
          <h3 className="text-2xl font-extrabold leading-tight">{d.dia}</h3>
          <p className="text-lg text-suave">{d.titulo}</p>
          {d.nota && <p className="mt-2 border-l-2 border-brasa pl-2 text-base">{d.nota}</p>}
          <ol className="mt-3 divide-y divide-linha border-y border-linha">
            {d.itens.map((it, n) => {
              const e = EXERCICIOS.find((x) => x.id === it.id);
              if (!e) return null;
              const idTimer = `${prefixo}-${i}-${n}-${it.id}`;
              const trocadoDe = original?.(i, n);
              return (
                <li key={idTimer} className="flex items-start gap-2.5 py-3 sm:gap-3">
                  <span className="w-5 shrink-0 font-titulo text-3xl font-extrabold tabular-nums sm:w-6">{n + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold leading-tight">{e.nome}</p>
                    {trocadoDe && <p className="text-[0.9375rem] text-brasa">No lugar de {trocadoDe}</p>}
                    <p className="text-base">{it.series}</p>
                    {!e.cardio && <p className="text-base text-suave">Descanso: {it.descanso}</p>}
                    {it.obs && <p className="mt-1 border-l-2 border-secundario pl-2 text-base">{it.obs}</p>}
                    {!e.cardio && (
                      <TimerDescanso
                        id={idTimer}
                        segundos={segundosDoDescanso(it.descanso)}
                        ativo={timerAtivo === idTimer}
                        som={som}
                        onIniciar={onIniciarTimer}
                      />
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  {onTrocar && temAlternativa(it.id) && (
                    <button
                      onClick={() => onTrocar(i, n)}
                      aria-label={`Trocar ${e.nome} por outro exercício`}
                      className="min-h-[2.75rem] min-w-[2.75rem] shrink-0 btn-contorno sm:min-h-[3rem] sm:min-w-[3rem]"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 4 3.5 7.5 7 11M3.5 7.5H17M17 13l3.5 3.5L17 20m3.5-3.5H7" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => onExplicar(it.id)}
                    aria-label={`Entender ${e.nome}`}
                    className="min-h-[2.75rem] min-w-[2.75rem] shrink-0 btn-contorno text-xl font-bold sm:min-h-[3rem] sm:min-w-[3rem]"
                  >
                    ?
                  </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
