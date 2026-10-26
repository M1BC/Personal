import type { ReactNode } from "react";
import { CAIXA, H1 } from "@/lib/layout";

// Abertura de cada página: carvão com brilho de brasa, título cromado e uma linha de explicação.
export function CabecalhoPagina({ titulo, texto, children }: { titulo: string; texto?: ReactNode; children?: ReactNode }) {
  return (
    <header className="destaque-brasa">
      <div className={`${CAIXA} pb-10 pt-10 md:pb-14 md:pt-16`}>
        <h1 className={H1}>
          <span className="titulo-metal">{titulo}</span>
        </h1>
        {texto && <p className="mt-4 max-w-[56ch] text-lg text-suave md:text-xl">{texto}</p>}
        {children}
      </div>
    </header>
  );
}
