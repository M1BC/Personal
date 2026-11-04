import type { ReactNode } from "react";
import { MARCA } from "@/lib/layout";
import { Simbolo } from "./Marca";

// Login e cadastro: uma coluna estreita e centralizada, com o nome do app no topo.
export function TelaAcesso({ titulo, texto, children }: { titulo: string; texto: ReactNode; children: ReactNode }) {
  return (
    <section className="flex min-h-[100dvh] justify-center px-5 pb-16 pt-[calc(2.5rem+env(safe-area-inset-top,0px))] md:items-center md:py-16">
      <div className="w-full max-w-md">
        <p className="flex items-center gap-3 text-lg font-semibold">
          <Simbolo className="h-10 w-10" />
          {MARCA.nome}
        </p>
        <h1 className="mt-10 text-[clamp(2rem,6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em]">{titulo}</h1>
        <p className="mt-3 text-lg text-suave">{texto}</p>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
