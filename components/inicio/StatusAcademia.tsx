"use client";
import { useEffect, useState } from "react";
import { agoraNaAcademia, QUADRO, situacao, type Situacao } from "@/lib/academia";

// "Aberta agora / Fechada agora", atualizado a cada 30 s. Calculado só no aparelho, para não divergir do servidor.
function useAgora() {
  const [agora, setAgora] = useState<Date | null>(null);
  useEffect(() => {
    setAgora(new Date());
    const t = window.setInterval(() => setAgora(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  return agora;
}

export function StatusAcademia() {
  const agora = useAgora();
  const s: Situacao | null = agora ? situacao(agora) : null;

  return (
    <p className="mt-6 flex min-h-[3.25rem] items-start gap-3">
      {s && (
        <>
          <span
            className={`relative mt-[0.55rem] h-3 w-3 shrink-0 rounded-full ${s.aberta ? (s.fechaLogo ? "bg-secundario" : "ponto-aberto bg-aberto") : "bg-suave/60"}`}
            aria-hidden="true"
          />
          <span>
            <span className={`block text-xl font-bold ${s.aberta ? (s.fechaLogo ? "text-secundario" : "text-aberto") : "text-tinta"}`}>{s.titulo}</span>
            <span className="block text-base text-suave">{s.detalhe}</span>
          </span>
        </>
      )}
    </p>
  );
}

export function QuadroHorario() {
  const agora = useAgora();
  const hoje = agora ? agoraNaAcademia(agora).dia : -1;

  return (
    <dl className="divide-y divide-linha overflow-hidden rounded-xl border border-linha">
      {QUADRO.map((l) => {
        const destaque = l.indices.includes(hoje);
        return (
          <div
            key={l.dias}
            className={`flex items-baseline justify-between gap-4 px-4 py-3.5 ${destaque ? "bg-primario/10 shadow-[inset_4px_0_0_rgb(var(--primario))]" : ""}`}
          >
            <dt className="font-semibold">
              {l.dias}
              {destaque && <span className="ml-2 text-[15px] font-semibold text-alerta">hoje</span>}
            </dt>
            <dd className={`font-titulo text-xl font-bold tabular-nums ${l.horario === "Fechada" ? "text-suave" : ""}`}>{l.horario}</dd>
          </div>
        );
      })}
    </dl>
  );
}
