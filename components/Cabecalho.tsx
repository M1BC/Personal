"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ehEquipe, meuPerfil } from "@/lib/equipe";
import { CAIXA, MARCA } from "@/lib/layout";
import { sair } from "@/lib/nuvem";
import { Icone, type NomeIcone } from "./Icone";

const LINKS: readonly { href: string; nome: string; icone: NomeIcone }[] = [
  { href: "/", nome: "Início", icone: "inicio" },
  { href: "/treinos", nome: "Treinos", icone: "treinos" },
  { href: "/anatomia", nome: "Anatomia", icone: "anatomia" },
  { href: "/refeicoes", nome: "Refeições", icone: "refeicoes" },
  { href: "/suplementos", nome: "Suplementos", icone: "suplementos" },
];

const ativoEm = (href: string, caminho: string) => (href === "/" ? caminho === "/" : caminho.startsWith(href));

// Topo com a logo da BGS. No computador a navegação fica aqui; no celular vai para a barra de baixo.
export function Cabecalho() {
  const caminho = usePathname();
  const acesso = caminho === "/login" || caminho === "/cadastro";
  const [equipe, setEquipe] = useState(false);
  useEffect(() => {
    if (!acesso) meuPerfil().then((p) => setEquipe(ehEquipe(p?.papel)));
  }, [acesso]);

  // Login e cadastro já mostram a marca grande e não têm menu (o app exige estar logado).
  if (acesso) return null;
  const noPainel = caminho.startsWith("/painel");

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-linha/70 bg-fundo/90 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">
        <div className={`${CAIXA} flex min-h-[60px] items-center gap-x-6`}>
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${MARCA.nome}, início`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/marca/bgs-logo-128.webp" alt="" width={40} height={40} className="h-10 w-10 rounded-full ring-1 ring-linha" />
            <span translate="no" className="whitespace-nowrap font-titulo text-[22px] font-extrabold leading-none tracking-wide">{MARCA.nome}</span>
          </Link>

          <nav aria-label="Principal" className="ml-auto hidden items-center gap-1 md:flex">
            {[...LINKS, ...(equipe ? [{ href: "/painel", nome: "Painel", icone: "painel" as const }] : [])].map((l) => {
              const ativo = ativoEm(l.href, caminho);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={ativo ? "page" : undefined}
                  className={`relative rounded-lg px-3 py-2 text-[15px] font-semibold transition-colors duration-100 ${
                    ativo ? "text-tinta" : "text-suave hover:bg-superficie hover:text-tinta"
                  }`}
                >
                  {l.nome}
                  {ativo && <span className="absolute inset-x-3 -bottom-[11px] h-[3px] rounded-full bg-primario" aria-hidden="true" />}
                </Link>
              );
            })}
          </nav>

          {/* No celular, abaixo de 640 px, Painel e Sair ficam só com o ícone (o nome continua para leitores de tela). */}
          <div className="ml-auto flex items-center gap-1 md:ml-2">
            {equipe && (
              <Link
                href="/painel"
                aria-current={noPainel ? "page" : undefined}
                className={`flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg px-2.5 text-[15px] font-semibold transition-colors duration-100 hover:bg-superficie hover:text-tinta sm:px-3 md:hidden ${
                  noPainel ? "text-tinta" : "text-suave"
                }`}
              >
                <Icone nome="painel" className={`h-5 w-5 ${noPainel ? "text-brasa" : ""}`} />
                <span className="sr-only sm:not-sr-only">Painel</span>
              </Link>
            )}
            <button
              onClick={() => sair()}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg px-2.5 text-[15px] font-semibold text-suave transition-colors duration-100 hover:bg-superficie hover:text-tinta sm:px-3"
            >
              <Icone nome="sair" className="h-5 w-5" />
              <span className="sr-only sm:not-sr-only">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <nav
        aria-label="Principal"
        className="barra-app fixed inset-x-0 bottom-0 z-30 border-t border-linha/80 bg-fundo/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md md:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {LINKS.map((l) => {
            const ativo = ativoEm(l.href, caminho);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={ativo ? "page" : undefined}
                  className={`relative flex min-h-[60px] flex-col items-center justify-center gap-1 text-[12px] font-semibold ${
                    ativo ? "text-tinta" : "text-suave"
                  }`}
                >
                  {ativo && <span className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-primario" aria-hidden="true" />}
                  <Icone nome={l.icone} className={`h-6 w-6 ${ativo ? "text-brasa" : ""}`} />
                  {l.nome}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
