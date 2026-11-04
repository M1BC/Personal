"use client";
import { EXERCICIOS } from "@/data/exercicios";
import { segundosDoDescanso } from "@/lib/tempo";
import { TimerDescanso } from "./TimerDescanso";

export interface ItemDia { id: string; series: string; descanso: string; obs?: string }
export interface Dia { dia: string; titulo: string; itens: ItemDia[] }

type Props = {
  dias: Dia[];
  prefixo: string; // separa os timers de fichas diferentes na mesma tela
  som: boolean;
  timerAtivo: string | null;
  onIniciarTimer: (id: string) => void;
  onExplicar: (idExercicio: string) => void;
};

// Cartões de cada dia da ficha, com timer de descanso e o "?" de cada exercício.
export function DiasFicha({ dias, prefixo, som, timerAtivo, onIniciarTimer, onExplicar }: Props) {
  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-2">
      {dias.map((d, i) => (
        <section key={i} className="bg-superficie p-4 sm:p-6">
          <h3 className="text-2xl font-extrabold leading-tight">{d.dia}</h3>
          <p className="text-lg text-suave">{d.titulo}</p>
          <ol className="mt-3 divide-y divide-linha border-y border-linha">
            {d.itens.map((it, n) => {
              const e = EXERCICIOS.find((x) => x.id === it.id);
              if (!e) return null;
              const idTimer = `${prefixo}-${i}-${n}-${it.id}`;
              return (
                <li key={idTimer} className="flex items-start gap-2.5 py-3 sm:gap-3">
                  <span className="w-5 shrink-0 font-titulo text-3xl font-extrabold tabular-nums sm:w-6">{n + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold leading-tight">{e.nome}</p>
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
                  <button
                    onClick={() => onExplicar(it.id)}
                    aria-label={`Entender ${e.nome}`}
                    className="min-h-[2.75rem] min-w-[2.75rem] shrink-0 btn-contorno text-xl font-bold sm:min-h-[3rem] sm:min-w-[3rem]"
                  >
                    ?
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
