"use client";
import { useEffect, useRef, useState } from "react";
import { MOVIMENTOS, progresso, quadro, type Tom } from "@/lib/boneco";
import type { GrupoMuscular } from "@/lib/types";

const CLASSE: Record<Tom, string> = {
  corpo: "fill-corpo",
  longe: "fill-linha", // cor sólida: transparência escureceria as juntas
  primario: "stroke-primario",
  secundario: "stroke-secundario",
  equip: "fill-suave",
  chao: "fill-linha",
};

type Props = { exercicioId: string; nome: string; primario: GrupoMuscular; secundarios: GrupoMuscular[] };

export const temAnimacao = (id: string) => id in MOVIMENTOS;

// Personagem fazendo o exercício em loop, com o músculo principal acendendo na contração.
export function Boneco({ exercicioId, nome, primario, secundarios }: Props) {
  const mov = MOVIMENTOS[exercicioId];
  const [t, setT] = useState(1);
  const [tocando, setTocando] = useState(true);
  const caixa = useRef<HTMLDivElement>(null);

  // Quem pediu menos animação no sistema começa com o movimento parado.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setTocando(false);
  }, []);

  useEffect(() => {
    if (!mov || !tocando) return;
    let quadroId = 0;
    let visivel = true;
    const inicio = performance.now();
    const passo = (agora: number) => {
      if (visivel) setT(progresso((agora - inicio) / 1000, mov.duracao));
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
  }, [mov, tocando, exercicioId]);

  if (!mov) return null;
  const formas = quadro(mov, tocando ? t : 1, primario, secundarios);

  return (
    <div ref={caixa} className="relative bg-superficie">
      <svg viewBox="0 0 240 160" className="block w-full" role="img" aria-label={`Animação: como fazer ${nome}`}>
        {formas.map((f, i) => {
          if (f.tipo === "retangulo") return <rect key={i} x={f.x} y={f.y} width={f.w} height={f.h} rx={f.rx ?? 0} className={CLASSE[f.tom]} />;
          if (f.tipo === "poligono") return <polygon key={i} points={f.pts.map((p) => p.join(",")).join(" ")} className={CLASSE[f.tom]} />;
          if (f.tipo === "circulo") return <circle key={i} cx={f.x} cy={f.y} r={f.r} className={CLASSE[f.tom]} />;
          return (
            <line
              key={i}
              x1={f.x1}
              y1={f.y1}
              x2={f.x2}
              y2={f.y2}
              strokeWidth={f.largura}
              strokeLinecap="round"
              opacity={f.opacidade ?? 1}
              className={CLASSE[f.tom]}
            />
          );
        })}
      </svg>
      <button
        onClick={() => setTocando(!tocando)}
        aria-label={tocando ? "Pausar animação" : "Ver o movimento"}
        className="absolute bottom-2 right-2 flex min-h-[44px] min-w-[44px] items-center justify-center bg-fundo/80 text-tinta transition-transform duration-100 ease-out active:scale-[0.95]"
      >
        {tocando ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" /></svg>
        )}
      </button>
    </div>
  );
}
