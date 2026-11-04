import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Cabecalho } from "@/components/Cabecalho";
import { RegistrarSW } from "@/components/RegistrarSW";
import { MARCA } from "@/lib/layout";

export const metadata: Metadata = {
  title: { default: MARCA.nome, template: `%s | ${MARCA.nome}` },
  description: "Seu treino, com o porquê de cada exercício.",
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
        <Cabecalho />
        <main id="conteudo">{children}</main>
      </body>
    </html>
  );
}
