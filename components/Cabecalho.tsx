"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CAIXA } from "@/lib/layout";
import { AlternarTema } from "./AlternarTema";

const LINKS = [
  ["/anatomia", "Anatomia"],
  ["/refeicoes", "Refeições"],
  ["/suplementos", "Suplementos"],
  ["/treinos", "Treinos"],
] as const;

export function Cabecalho() {
  const caminho = usePathname();
  return (
    <header className="sticky top-0 z-10 border-b border-linha bg-fundo pt-[env(safe-area-inset-top,0px)]">
      <div className={`${CAIXA} flex flex-wrap items-center gap-x-6`}>
        <Link href="/anatomia" className="flex min-h-[56px] items-center gap-2 font-extrabold tracking-tight">
          <span className="h-3 w-3 bg-primario" aria-hidden="true" />
          Treino &amp; Nutrição Consciente
        </Link>
        <nav
          aria-label="Principal"
          className="order-3 flex w-full gap-4 overflow-x-auto md:order-none md:ml-auto md:w-auto md:gap-6 md:overflow-visible"
        >
          {LINKS.map(([href, nome]) => {
            const ativo = caminho === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={`whitespace-nowrap border-b-4 py-3 text-[15px] font-semibold md:text-base ${
                  ativo ? "border-primario" : "border-transparent hover:border-linha"
                }`}
              >
                {nome}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto md:ml-0">
          <AlternarTema />
        </div>
      </div>
    </header>
  );
}
