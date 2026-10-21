"use client";
import { useEffect, useRef, type ReactNode } from "react";

type Props = { aberto: boolean; titulo: string; onFechar: () => void; children: ReactNode };

export function Modal({ aberto, titulo, onFechar, children }: Props) {
  const botaoFechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", tecla);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    botaoFechar.current?.focus();
    return () => {
      window.removeEventListener("keydown", tecla);
      document.body.style.overflow = overflow;
      anterior?.focus();
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;
  return (
    <div
      className="animar-fundo fixed inset-0 z-50 flex items-end justify-center bg-black/70 md:items-center md:p-6"
      onClick={onFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal"
        onClick={(e) => e.stopPropagation()}
        className="animar-folha max-h-[85dvh] w-full max-w-lg overflow-y-auto bg-fundo p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] md:pb-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 id="titulo-modal" className="text-3xl font-extrabold leading-tight tracking-tight">
            {titulo}
          </h3>
          <button
            ref={botaoFechar}
            onClick={onFechar}
            aria-label="Fechar"
            className="min-h-[48px] min-w-[48px] bg-superficie text-xl font-bold active:scale-[0.95] hover:bg-corpo"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
