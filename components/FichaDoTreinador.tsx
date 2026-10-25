"use client";
import { useEffect, useState } from "react";
import { minhaFicha, type RegistroFicha } from "@/lib/equipe";
import { DiasFicha } from "./DiasFicha";

type Props = {
  som: boolean;
  timerAtivo: string | null;
  onIniciarTimer: (id: string) => void;
  onExplicar: (id: string) => void;
};

const data = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });

// Ficha que o treinador montou para o aluno. Aparece no topo de Treinos; sem ficha, não mostra nada.
export function FichaDoTreinador(props: Props) {
  const [registro, setRegistro] = useState<RegistroFicha | null>(null);

  useEffect(() => {
    minhaFicha().then(setRegistro);
  }, []);

  if (!registro || registro.conteudo.dias.length === 0) return null;
  const f = registro.conteudo;

  return (
    <div className="animar mb-16">
      <p className="text-base font-bold uppercase tracking-widest text-primario">Ficha do seu treinador</p>
      <h2 className="mt-2 text-4xl font-extrabold leading-none tracking-tight">{f.titulo || "Seu treino"}</h2>
      <p className="mt-2 text-base text-suave">Atualizada em {data(registro.atualizado_em)}</p>
      {f.observacoes && <p className="mt-4 max-w-[70ch] whitespace-pre-line border-l-4 border-secundario bg-superficie p-4 text-lg">{f.observacoes}</p>}
      <DiasFicha dias={f.dias} prefixo="treinador" {...props} />
      <hr className="mt-16 border-linha" />
      <p className="mt-10 text-2xl font-extrabold tracking-tight">Ficha automática</p>
      <p className="mt-1 max-w-[60ch] text-lg text-suave">Quer comparar ou treinar em outro dia? Monte uma ficha pelo seu objetivo.</p>
      <div className="mt-6" />
    </div>
  );
}
