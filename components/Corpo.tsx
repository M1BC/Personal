"use client";
import { Fragment, useState } from "react";
import { GRUPOS } from "@/data/exercicios";
import { ALTURA, LARGURA, SILHUETA, VISTAS } from "@/lib/anatomia";
import type { GrupoMuscular } from "@/lib/types";

type Props = {
  primario: GrupoMuscular;
  secundarios: GrupoMuscular[];
  onGrupo: (g: GrupoMuscular) => void;
};

// Se existir public/anatomia.png, ela vira o fundo e os músculos ficam como camada clicável por cima.
// Sem a imagem, o próprio desenho anatômico em SVG é exibido.
const FOTO = "/anatomia.png";

export function Corpo({ primario, secundarios, onGrupo }: Props) {
  const [foto, setFoto] = useState<"testando" | "ok" | "sem">("testando");
  const [sobre, setSobre] = useState<GrupoMuscular | null>(null);
  const comFoto = foto === "ok";

  const classe = (g: GrupoMuscular) => {
    const base = "cursor-pointer transition-[fill,stroke,opacity] duration-200 ease-out outline-none";
    const contorno = sobre === g ? "stroke-tinta" : comFoto ? "stroke-transparent" : "stroke-fundo/70";
    // Sobre a foto as cores ficam translúcidas para o músculo da imagem continuar visível.
    if (g === primario) return `${base} ${contorno} ${comFoto ? "fill-primario/55" : "fill-primario"} musculo-ativo`;
    if (secundarios.includes(g)) return `${base} ${contorno} ${comFoto ? "fill-secundario/45" : "fill-secundario/70"}`;
    return `${base} ${contorno} ${comFoto ? "fill-transparent" : "fill-corpo"} focus-visible:stroke-tinta`;
  };

  const desenho = (
    <svg
      viewBox={`0 0 ${LARGURA} ${ALTURA}`}
      preserveAspectRatio={comFoto ? "none" : "xMidYMid meet"}
      className={comFoto ? "absolute inset-0 h-full w-full" : "w-full"}
      role="group"
      aria-label="Mapa muscular: frente e costas"
    >
      {VISTAS.map((v) => (
        <g key={v.nome} transform={`translate(${v.cx} 0)`}>
          {!comFoto && (
            <>
              <path d={SILHUETA} className="fill-superficie" />
              <path d={SILHUETA} transform="scale(-1 1)" className="fill-superficie" />
              <g className="pointer-events-none fill-corpo/45 stroke-fundo/60" strokeWidth={1}>
                <path d={v.decorativos} />
                <path d={v.decorativos} transform="scale(-1 1)" />
              </g>
            </>
          )}
          {v.musculos.map((m, i) => (
            <Fragment key={i}>
              {[1, -1].map((lado) => (
                <path
                  key={lado}
                  d={m.d}
                  transform={lado === -1 ? "scale(-1 1)" : undefined}
                  strokeWidth={1.2}
                  strokeLinejoin="round"
                  role="button"
                  tabIndex={lado === 1 ? 0 : -1}
                  aria-label={`${GRUPOS[m.grupo].nome}: entender o que faz`}
                  onClick={() => onGrupo(m.grupo)}
                  onPointerEnter={() => setSobre(m.grupo)}
                  onPointerLeave={() => setSobre(null)}
                  onFocus={() => setSobre(m.grupo)}
                  onBlur={() => setSobre(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onGrupo(m.grupo);
                    }
                  }}
                  className={classe(m.grupo)}
                />
              ))}
            </Fragment>
          ))}
          {!comFoto && (
            <g className="pointer-events-none fill-none stroke-fundo/50" strokeWidth={0.8} strokeLinecap="round">
              <path d={v.detalhes} />
              <path d={v.detalhes} transform="scale(-1 1)" />
            </g>
          )}
          {!comFoto && (
            <text x={0} y={414} textAnchor="middle" fontSize={11} className="fill-suave font-semibold">
              {v.nome}
            </text>
          )}
        </g>
      ))}
    </svg>
  );

  return (
    <div className="mx-auto w-full max-w-md">
      {foto !== "sem" && (
        <div className={comFoto ? "relative" : "hidden"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FOTO}
            alt="Anatomia muscular, frente e costas"
            className="block h-auto w-full select-none"
            draggable={false}
            onLoad={() => setFoto("ok")}
            onError={() => setFoto("sem")}
          />
          {comFoto && desenho}
        </div>
      )}
      {!comFoto && desenho}
      <p className="mt-2 min-h-[1.5rem] text-center text-base font-semibold" aria-hidden>
        {sobre ? GRUPOS[sobre].nome : ""}
      </p>
    </div>
  );
}
