"use client";
import { useEffect, useState } from "react";

type Tema = "escuro" | "claro";

export function AlternarTema() {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    setTema(document.documentElement.dataset.tema === "claro" ? "claro" : "escuro");
  }, []);

  const alternar = () => {
    const novo: Tema = tema === "claro" ? "escuro" : "claro";
    document.documentElement.dataset.tema = novo;
    try {
      localStorage.setItem("tema", novo);
    } catch {
      // Sem armazenamento: o tema vale só até recarregar a página.
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", novo === "claro" ? "#eeeeec" : "#0c0c0d");
    setTema(novo);
  };

  const claro = tema === "claro";
  return (
    <button
      onClick={alternar}
      aria-label={claro ? "Ativar modo escuro" : "Ativar modo claro"}
      title={claro ? "Modo escuro" : "Modo claro"}
      className="flex min-h-[48px] min-w-[48px] items-center justify-center transition-transform duration-100 ease-out active:scale-[0.92] hover:bg-superficie"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        {claro ? (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
