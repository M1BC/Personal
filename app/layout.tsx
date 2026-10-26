import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Cabecalho } from "@/components/Cabecalho";
import { PerfilProvider } from "@/components/PerfilProvider";
import { RegistrarSW } from "@/components/RegistrarSW";
import { CAIXA, MARCA } from "@/lib/layout";

export const metadata: Metadata = {
  title: { default: MARCA.nome, template: `%s | ${MARCA.nome}` },
  description: "Seu treino, sua alimentação e seus suplementos na BGS Pro Fitness, com o porquê de cada escolha.",
  applicationName: MARCA.nome,
  appleWebApp: { capable: true, title: MARCA.curto, statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#100D0C",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preload" href="/fontes/big-shoulders-display.woff" as="font" type="font/woff" crossOrigin="" />
        <link rel="preload" href="/fontes/barlow-400.woff" as="font" type="font/woff" crossOrigin="" />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#conteudo"
          className="fixed left-4 top-4 z-50 -translate-y-[200%] rounded-lg bg-primario px-4 py-3 font-bold text-white transition-transform duration-150 focus:translate-y-0"
        >
          Pular para o conteúdo
        </a>
        <RegistrarSW />
        <PerfilProvider>
          <Cabecalho />
          <main id="conteudo">{children}</main>
          <footer className="border-t border-linha">
            <div className={`${CAIXA} flex flex-col gap-4 py-8 text-[15px] text-suave pb-[calc(2rem+env(safe-area-inset-bottom,0px))] sm:flex-row sm:items-center sm:gap-6`}>
              <span className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/marca/bgs-logo-128.webp" alt="" width={32} height={32} className="h-8 w-8 rounded-full opacity-90" />
                <span translate="no" className="font-titulo text-lg font-bold text-tinta">{MARCA.nome}</span>
              </span>
              <p className="max-w-[60ch]">
                Conteúdo educativo. Não substitui médico, nutricionista ou educador físico: para dieta e suplementos, consulte um nutricionista.
              </p>
            </div>
          </footer>
        </PerfilProvider>
      </body>
    </html>
  );
}
