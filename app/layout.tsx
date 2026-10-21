import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Cabecalho } from "@/components/Cabecalho";
import { PerfilProvider } from "@/components/PerfilProvider";
import { CAIXA } from "@/lib/layout";

// Aplica o tema salvo antes da página aparecer, para não piscar. Padrão: escuro.
const SCRIPT_TEMA = `try{var t=localStorage.getItem("tema");document.documentElement.dataset.tema=t==="claro"?"claro":"escuro"}catch(e){}`;

export const metadata: Metadata = {
  title: "Treino & Nutrição Consciente",
  description: "Entenda o porquê de cada exercício e de cada grama de proteína.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c0c0d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-tema="escuro" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="font-sans antialiased">
        <PerfilProvider>
          <Cabecalho />
          <main>{children}</main>
          <footer
            className={`${CAIXA} border-t border-linha py-10 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] text-base text-suave`}
          >
            <p>Estas são referências educacionais, consulte um nutricionista.</p>
            <p className="mt-1">Este app é educativo e não substitui médico, nutricionista ou educador físico.</p>
          </footer>
        </PerfilProvider>
      </body>
    </html>
  );
}
