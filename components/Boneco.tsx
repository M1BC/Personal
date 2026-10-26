"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { MOVIMENTOS } from "@/data/movimentos";
import { enquadrar, estado, quadro, type Estado, type Tom } from "@/lib/boneco";
import type { GrupoMuscular } from "@/lib/types";

const PREENCHER: Record<Tom, string> = {
  corpo: "fill-boneco",
  longe: "fill-boneco-longe",
  primario: "fill-primario",
  secundario: "fill-secundario",
  equip: "fill-equip",
  chao: "fill-linha",
  fantasma: "fill-fantasma",
  trajeto: "fill-tinta",
};
const CONTORNO: Record<Tom, string> = {
  corpo: "stroke-boneco",
  longe: "stroke-boneco-longe",
  primario: "stroke-primario",
  secundario: "stroke-secundario",
  equip: "stroke-equip",
  chao: "stroke-linha",
  fantasma: "stroke-fantasma",
  trajeto: "stroke-tinta",
};

type Props = { exercicioId: string; nome: string; primario: GrupoMuscular; secundarios: GrupoMuscular[] };

export const temAnimacao = (id: string) => id in MOVIMENTOS;

// Personagem fazendo o exercício em loop, no ritmo de treino, com guias para aprender o movimento.
export function Boneco({ exercicioId, nome, primario, secundarios }: Props) {
  const mov = MOVIMENTOS[exercicioId];
  const [est, setEst] = useState<Estado | null>(null);
  const [tocando, setTocando] = useState(true);
  const [lento, setLento] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const relogio = useRef(0); // segundos de animação acumulados (continua de onde parou ao pausar ou mudar a velocidade)

  // Quem pediu menos animação no sistema começa com o movimento parado.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setTocando(false);
  }, []);

  useEffect(() => {
    relogio.current = 0;
    if (mov) setEst(estado(0, mov));
  }, [mov]);

  useEffect(() => {
    if (!mov || !tocando) return;
    let quadroId = 0;
    let visivel = true;
    let anterior = performance.now();
    const passo = (agora: number) => {
      const dt = Math.min(0.1, (agora - anterior) / 1000);
      anterior = agora;
      if (visivel) {
        relogio.current += dt * (lento ? 0.45 : 1);
        setEst(estado(relogio.current, mov));
      }
      quadroId = requestAnimationFrame(passo);
    };
    quadroId = requestAnimationFrame(passo);
    // Pausa quando sai da tela, para poupar bateria.
    const obs = new IntersectionObserver(([e]) => (visivel = e.isIntersecting));
    if (caixa.current) obs.observe(caixa.current);
    return () => {
      cancelAnimationFrame(quadroId);
      obs.disconnect();
    };
  }, [mov, tocando, lento]);

  const vb = useMemo(() => (mov ? enquadrar(mov) : null), [mov]);
  if (!mov || !est || !vb) return null;
  const formas = quadro(mov, est.t, primario, secundarios, { destino: est.destino, emEsforco: est.emEsforco });

  return (
    <div ref={caixa}>
      <div className="relative bg-superficie">
        <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} className="block aspect-[4/3] w-full" role="img" aria-label={`Animação: como fazer ${nome}`}>
          {formas.map((f, i) => {
            if (f.tipo === "retangulo") return <rect key={i} x={f.x} y={f.y} width={f.w} height={f.h} rx={f.rx ?? 0} className={PREENCHER[f.tom]} />;
            if (f.tipo === "poligono") return <polygon key={i} points={f.pts.map((p) => p.join(",")).join(" ")} className={PREENCHER[f.tom]} />;
            if (f.tipo === "circulo") return <circle key={i} cx={f.x} cy={f.y} r={f.r} className={PREENCHER[f.tom]} />;
            if (f.tipo === "caminho")
              return (
                <polyline
                  key={i}
                  points={f.pts.map((p) => p.join(",")).join(" ")}
                  fill="none"
                  strokeWidth={1.4}
                  strokeDasharray={f.tracejado ? "3 3" : undefined}
                  strokeLinecap="round"
                  opacity={0.7}
                  className={CONTORNO[f.tom]}
                />
              );
            return (
              <line key={i} x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} strokeWidth={f.largura} strokeLinecap="round" opacity={f.opacidade ?? 1} className={CONTORNO[f.tom]} />
            );
          })}
        </svg>

        <div className="absolute bottom-2 right-2 flex gap-2">
          <button
            onClick={() => setLento(!lento)}
            aria-pressed={lento}
            className={`min-h-[2.75rem] px-3 text-sm font-bold transition-transform duration-100 ease-out active:scale-[0.95] rounded-lg ${lento ? "bg-primario text-white" : "bg-fundo/85 text-tinta"}`}
          >
            Câmera lenta
          </button>
          <button
            onClick={() => setTocando(!tocando)}
            aria-label={tocando ? "Pausar animação" : "Ver o movimento"}
            className="flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center rounded-lg bg-fundo/85 text-tinta transition-transform duration-100 ease-out active:scale-[0.95]"
          >
            {tocando ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Legenda da fase atual */}
      <p className="mt-2 flex min-h-[3.25rem] items-start gap-2 text-lg font-semibold leading-snug" aria-live="off">
        <span
          className={`mt-1.5 h-3 w-3 shrink-0 transition-colors duration-200 ${est.emEsforco ? "bg-primario" : "bg-suave"}`}
          aria-hidden="true"
        />
        <span>
          <span className="text-suave">{est.rotulo} · </span>
          {est.legenda}
        </span>
      </p>

      <p className="mt-3 text-base font-semibold">Pontos-chave</p>
      <ul className="mt-1 space-y-1 text-base text-suave">
        {mov.dicas.map((d) => (
          <li key={d} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-primario" aria-hidden="true" />
            {d}
          </li>
        ))}
      </ul>
      {mov.ciclo ? (
        <p className="mt-3 text-sm text-suave">A linha tracejada mostra o caminho que o pé faz a cada passada ou giro.</p>
      ) : mov.esforco !== "isometrico" && (
        <p className="mt-3 text-sm text-suave">
          A silhueta apagada ao fundo mostra a posição de destino{mov.trajeto !== "nenhum" ? ", e a linha tracejada mostra o caminho do movimento" : ""}.
        </p>
      )}
    </div>
  );
}
