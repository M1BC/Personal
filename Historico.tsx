"use client";
import Link from "next/link";
import { useState } from "react";
import { useHistoricoTreinos } from "@/hooks/useHistoricoTreinos";
import { cabecalhoDoTreino, descreverExercicio } from "@/lib/historico";

export function Historico() {
  const { treinos, carregado, apagar } = useHistoricoTreinos();
  const [aberto, setAberto] = useState<string | null>(null);

  if (!carregado) return <p className="text-lg text-suave">Carregando...</p>;
  if (treinos.length === 0) {
    return (
      <div>
        <p className="max-w-[62ch] text-xl">Nenhum treino registrado ainda. Escolha uma ficha, inicie o treino e finalize para ele aparecer aqui.</p>
        <Link href="/treinos" className="btn mt-4">Ir para Treinos</Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-lg font-semibold">{treinos.length} {treinos.length === 1 ? "treino registrado" : "treinos registrados"}</p>
      <ul className="mt-3 grid gap-3">
        {treinos.map((t) => {
          const abre = aberto === t.id;
          return (
            <li key={t.id} className="bg-superficie">
              <button
                aria-expanded={abre}
                aria-controls={`detalhes-${t.id}`}
                onClick={() => setAberto(abre ? null : t.id)}
                className="flex min-h-[64px] w-full items-center justify-between gap-4 p-5 text-left"
              >
                <span>
                  <span className="block text-xl font-extrabold leading-tight">{cabecalhoDoTreino(t)}</span>
                  <span className="block text-base text-suave">{t.exercicios.length} {t.exercicios.length === 1 ? "exercício" : "exercícios"}</span>
                </span>
                <span aria-hidden="true" className={`text-3xl font-bold transition-transform duration-150 ease-out ${abre ? "rotate-45" : ""}`}>+</span>
              </button>
              {abre && (
                <div id={`detalhes-${t.id}`} className="animar border-t border-linha p-5">
                  <ul className="grid gap-3">
                    {t.exercicios.map((ex) => (
                      <li key={ex.id}>
                        <p className="text-lg font-semibold">
                          {ex.nome}
                          {ex.concluido && (
                            <>
                              <span aria-hidden="true"> ✓</span>
                              <span className="sr-only"> (concluído)</span>
                            </>
                          )}
                        </p>
                        <p className="text-base text-suave">{descreverExercicio(ex)}</p>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      if (window.confirm("Apagar este treino do histórico?")) {
                        apagar(t.id);
                        setAberto(null);
                      }
                    }}
                    className="mt-4 min-h-[48px] underline underline-offset-4"
                  >
                    Apagar este treino
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-6 max-w-[70ch] text-base text-suave">
        O histórico fica salvo só neste navegador. Limpar os dados do site ou trocar de aparelho apaga os registros.
      </p>
    </div>
  );
}
