"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { prepararAudio, tocarBipe } from "@/lib/som";
import { formatarTempo } from "@/lib/tempo";

type Estado = "parado" | "rodando" | "pausado" | "fim";

interface Props {
  id: string;
  segundos: number;
  ativo: boolean; // este é o timer em uso na tela? (só um corre por vez)
  som: boolean;
  onIniciar: (id: string) => void;
}

const BTN =
  "min-h-[48px] btn-contorno px-4 font-bold";

export function TimerDescanso({ id, segundos, ativo, som, onIniciar }: Props) {
  const [estado, setEstado] = useState<Estado>("parado");
  const [restante, setRestante] = useState(segundos);
  const [aviso, setAviso] = useState("");
  const fimEm = useRef(0); // horário (em ms) em que o descanso termina: o timer se guia pelo relógio, não por contagem de ticks
  const restanteMs = useRef(0);
  const intervalo = useRef<number | null>(null);
  const somRef = useRef(som);
  somRef.current = som;

  const parar = useCallback(() => {
    if (intervalo.current !== null) {
      window.clearInterval(intervalo.current);
      intervalo.current = null;
    }
  }, []);

  const concluir = useCallback(() => {
    parar();
    setRestante(0);
    setEstado("fim");
    setAviso("Descanso concluído");
    if (somRef.current) tocarBipe();
  }, [parar]);

  const tique = useCallback(() => {
    const ms = fimEm.current - Date.now();
    if (ms <= 0) concluir();
    else setRestante(Math.ceil(ms / 1000));
  }, [concluir]);

  const correr = useCallback(
    (ms: number) => {
      parar();
      fimEm.current = Date.now() + ms;
      intervalo.current = window.setInterval(tique, 200);
      setEstado("rodando");
    },
    [parar, tique]
  );

  const zerar = useCallback(() => {
    parar();
    setEstado("parado");
    setRestante(segundos);
    setAviso("Descanso zerado");
  }, [parar, segundos]);

  const iniciar = () => {
    prepararAudio(); // dentro do clique, para o navegador liberar o som
    onIniciar(id);
    setRestante(segundos);
    setAviso(`Descanso iniciado: ${segundos} segundos`);
    correr(segundos * 1000);
  };

  const pausar = () => {
    parar();
    const ms = Math.max(0, fimEm.current - Date.now());
    restanteMs.current = ms;
    setRestante(Math.ceil(ms / 1000));
    setEstado("pausado");
    setAviso("Descanso pausado");
  };

  const continuar = () => {
    prepararAudio();
    setAviso("Descanso retomado");
    correr(restanteMs.current);
  };

  // Limpa o intervalo ao sair da tela.
  useEffect(() => parar, [parar]);

  // Se outro timer foi iniciado, este volta ao começo.
  useEffect(() => {
    if (!ativo && estado !== "parado") zerar();
  }, [ativo, estado, zerar]);

  // Ao voltar para a aba, confere o relógio na hora (navegadores atrasam timers em segundo plano).
  useEffect(() => {
    const aoVoltar = () => {
      if (document.visibilityState === "visible" && intervalo.current !== null) tique();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => document.removeEventListener("visibilitychange", aoVoltar);
  }, [tique]);

  const urgente = estado === "rodando" && restante <= 5;
  const fracao = segundos > 0 ? Math.min(1, Math.max(0, restante / segundos)) : 0;

  return (
    <div className="mt-2">
      <span className="sr-only" role="status" aria-live="polite">{aviso}</span>
      {estado === "parado" ? (
        <button className={BTN} onClick={iniciar}>Iniciar descanso</button>
      ) : (
        <div role="timer" aria-label="Contagem regressiva do descanso">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className={`text-4xl font-extrabold leading-none tabular-nums ${urgente ? "text-alerta" : ""}`}>{formatarTempo(restante)}</span>
            {urgente && <span className="text-base font-bold text-alerta">Quase lá</span>}
            {estado === "fim" && <span className="text-base font-bold">Descanso concluído</span>}
          </div>
          <div className="mt-2 h-2 bg-corpo" aria-hidden="true">
            <div
              className={`h-2 origin-left transition-transform duration-200 ease-linear motion-reduce:transition-none ${urgente ? "bg-primario" : "bg-tinta"}`}
              style={{ transform: `scaleX(${fracao})` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {estado === "rodando" && <button className={BTN} onClick={pausar}>Pausar</button>}
            {estado === "pausado" && <button className={BTN} onClick={continuar}>Continuar</button>}
            {estado === "fim" && <button className={BTN} onClick={iniciar}>Reiniciar descanso</button>}
            <button className={BTN} onClick={zerar}>Zerar</button>
          </div>
        </div>
      )}
    </div>
  );
}
