import type { ReactNode } from "react";
import { CAIXA, H1 } from "@/lib/layout";

// Abertura de cada página: título e uma linha de explicação, separados do conteúdo por um fio.
export function CabecalhoPagina({ titulo, texto, children }: { titulo: string; texto?: ReactNode; children?: ReactNode }) {
  return (
    <header className="border-b border-linha">
      <div className={`${CAIXA} pb-8 pt-10 md:pb-12 md:pt-16`}>
        <h1 className={H1}>{titulo}</h1>
        {texto && <p className="mt-4 max-w-[60ch] text-lg text-suave">{texto}</p>}
        {children}
      </div>
    </header>
  );
}
