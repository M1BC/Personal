import type { ReactNode } from "react";
import { MARCA } from "@/lib/layout";

// Login e cadastro: no computador, a marca ocupa a metade esquerda; no celular, vira uma faixa curta no topo.
export function TelaAcesso({ titulo, texto, children }: { titulo: string; texto: ReactNode; children: ReactNode }) {
  return (
    <div className="md:grid md:min-h-[100dvh] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="destaque-brasa flex items-center md:after:hidden">
        <div className="mx-auto flex w-full max-w-xl items-center gap-5 px-5 pb-8 pt-[calc(2rem+env(safe-area-inset-top,0px))] md:flex-col md:items-start md:gap-8 md:px-12 md:py-16">
          <div className="logo-acesa w-24 shrink-0 sm:w-28 md:w-64 lg:w-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/marca/bgs-logo-512.webp" alt="" width={512} height={512} className="h-auto w-full" fetchPriority="high" />
          </div>
          <div>
            <p className="font-titulo text-3xl font-extrabold leading-none md:text-6xl">
              <span translate="no" className="titulo-metal">{MARCA.nome}</span>
            </p>
            <p className="mt-2 max-w-[34ch] text-base text-suave md:mt-4 md:text-lg">Treino, alimentação e suplementos, com o porquê de cada escolha.</p>
          </div>
        </div>
      </div>
      <section className="border-linha px-5 pb-24 pt-10 md:flex md:items-center md:border-l md:px-12 md:py-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-[clamp(2.75rem,8vw,4.5rem)] font-extrabold leading-[0.9]">{titulo}</h1>
          <p className="mt-4 text-lg text-suave">{texto}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </div>
  );
}
