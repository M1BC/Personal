"use client";
import { GRUPOS } from "@/data/exercicios";
import type { GrupoMuscular } from "@/lib/types";

// [grupo, deslocamento horizontal do centro, y, raio x, raio y, tem par espelhado]
type Reg = [GrupoMuscular, number, number, number, number, boolean];
const FRENTE: Reg[] = [
  ["peitoral", 9, 48, 9, 8, true],
  ["ombros", 21, 38, 7, 7, true],
  ["biceps", 28, 58, 5, 11, true],
  ["core", 0, 76, 11, 14, false],
  ["quadriceps", 10, 122, 8, 22, true],
];
const COSTAS: Reg[] = [
  ["dorsais", 10, 56, 9, 14, true],
  ["ombros", 21, 38, 7, 7, true],
  ["triceps", 28, 58, 5, 11, true],
  ["lombar", 0, 82, 10, 8, false],
  ["gluteos", 9, 104, 9, 8, true],
  ["posteriores", 10, 134, 7, 18, true],
  ["panturrilhas", 9, 170, 6, 13, true],
];

type Props = {
  primario: GrupoMuscular;
  secundarios: GrupoMuscular[];
  onGrupo: (g: GrupoMuscular) => void;
};

export function Corpo({ primario, secundarios, onGrupo }: Props) {
  const cor = (g: GrupoMuscular) =>
    g === primario ? "fill-primario" : secundarios.includes(g) ? "fill-secundario/50" : "fill-transparent";

  const vista = (c: number, regs: Reg[], nome: string) => (
    <g key={nome}>
      <circle cx={c} cy={16} r={11} className="fill-corpo" />
      <rect x={c - 20} y={32} width={40} height={62} rx={12} className="fill-corpo" />
      <rect x={c - 33} y={34} width={11} height={56} rx={5} className="fill-corpo" />
      <rect x={c + 22} y={34} width={11} height={56} rx={5} className="fill-corpo" />
      <rect x={c - 18} y={96} width={16} height={92} rx={7} className="fill-corpo" />
      <rect x={c + 2} y={96} width={16} height={92} rx={7} className="fill-corpo" />
      {regs.flatMap(([g, dx, cy, rx, ry, par]) =>
        (par ? [-dx, dx] : [0]).map((d) => (
          <ellipse
            key={`${g}${d}`}
            cx={c + d}
            cy={cy}
            rx={rx}
            ry={ry}
            strokeWidth={1.5}
            role="button"
            tabIndex={0}
            aria-label={`Entender ${GRUPOS[g].nome}`}
            onClick={() => onGrupo(g)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onGrupo(g);
              }
            }}
            className={`${cor(g)} cursor-pointer stroke-transparent transition-[fill] duration-150 hover:stroke-tinta`}
          />
        ))
      )}
      <text x={c} y={204} textAnchor="middle" fontSize={10} className="fill-suave">
        {nome}
      </text>
    </g>
  );

  return (
    <svg viewBox="0 0 230 210" className="w-full max-w-md" role="group" aria-label="Mapa muscular: frente e costas">
      {vista(55, FRENTE, "Frente")}
      {vista(175, COSTAS, "Costas")}
    </svg>
  );
}
