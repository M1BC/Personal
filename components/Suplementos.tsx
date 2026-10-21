"use client";
import { useCallback, useState } from "react";
import { MARCAS_REF, METAS, ORCAMENTOS, PRECOS_REF, SUPLEMENTOS, type MetaPeso, type Orcamento } from "@/lib/suplementos";
import { Modal } from "./Modal";

const BOTAO_AJUDA =
  "min-h-[48px] min-w-[48px] border-2 border-tinta text-xl font-bold active:scale-[0.95] hover:bg-tinta hover:text-fundo";
const OPCAO = "min-h-[56px] px-5 py-3 text-left transition-transform duration-100 ease-out active:scale-[0.97]";

export function Suplementos() {
  const [orc, setOrc] = useState<Orcamento>("moderado");
  const [meta, setMeta] = useState<MetaPeso>("manutencao");
  const [aberto, setAberto] = useState<string | null>(null);
  const fechar = useCallback(() => setAberto(null), []);
  const o = ORCAMENTOS[orc];
  const sup = aberto ? SUPLEMENTOS[aberto] : null;
  const hiper = SUPLEMENTOS.hipercalorico;
  const mostrarAlerta = orc === "folgado" && meta === "ganho"; // só nessa combinação

  return (
    <div>
      <p className="max-w-[62ch] border-l-4 border-primario bg-superficie p-4 text-lg" role="note">
        <strong>Converse com um médico ou nutricionista antes de usar qualquer suplemento.</strong> Eles não
        substituem a alimentação e podem não ser indicados para todas as pessoas.
      </p>

      <p className="mt-8 text-lg font-semibold">Quanto você pode gastar por mês?</p>
      <div role="group" aria-label="Orçamento mensal" className="mt-2 grid gap-2 sm:grid-cols-3">
        {(Object.keys(ORCAMENTOS) as Orcamento[]).map((k) => (
          <button key={k} aria-pressed={k === orc} onClick={() => setOrc(k)} className={`${OPCAO} ${k === orc ? "bg-tinta text-fundo" : "bg-superficie hover:bg-corpo"}`}>
            <span className="block text-xl font-extrabold">{ORCAMENTOS[k].nome}</span>
            <span className="block text-base opacity-80">{ORCAMENTOS[k].curto}</span>
          </button>
        ))}
      </div>

      <p className="mt-6 text-lg font-semibold">Qual é o seu objetivo?</p>
      <div role="group" aria-label="Objetivo" className="mt-2 grid gap-2 sm:grid-cols-3">
        {(Object.keys(METAS) as MetaPeso[]).map((k) => (
          <button key={k} aria-pressed={k === meta} onClick={() => setMeta(k)} className={`${OPCAO} text-lg font-bold ${k === meta ? "bg-tinta text-fundo" : "bg-superficie hover:bg-corpo"}`}>
            {METAS[k]}
          </button>
        ))}
      </div>

      <div key={orc} className="animar mt-10" aria-live="polite">
        <p className="max-w-[62ch] text-xl">{o.resumo}</p>
        <ol className="mt-6 divide-y divide-linha border-y border-linha">
          {o.ids.map((id, i) => {
            const s = SUPLEMENTOS[id];
            const opcional = o.opcionais?.includes(id);
            return (
              <li key={id} className="flex flex-wrap items-start gap-x-5 gap-y-2 py-5">
                <span className="w-8 text-4xl font-extrabold tabular-nums">{i + 1}</span>
                <div className="min-w-0 flex-1 basis-64">
                  <h2 className="text-2xl font-extrabold">
                    {s.nome}
                    {opcional && <span className="ml-3 text-base font-semibold text-suave">opcional</span>}
                  </h2>
                  <p className="mt-1 text-lg">{s.funcao_principal}</p>
                  <p className="mt-1 text-base text-suave">Marcas conhecidas: {s.marcas.join(", ")}.</p>
                  <p className="mt-1 text-base text-suave">Preço estimado: {s.faixa_preco_brl}.</p>
                </div>
                <button onClick={() => setAberto(id)} aria-label={`Entender ${s.nome}`} className={BOTAO_AJUDA}>?</button>
              </li>
            );
          })}
        </ol>
      </div>

      {mostrarAlerta && (
        <section className="animar mt-10 border-l-4 border-primario bg-superficie p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold">Alerta: hipercalórico</h2>
              <p className="mt-2 max-w-[56ch] text-lg">{hiper.alerta_uso}</p>
              <p className="mt-2 text-base text-suave">Marcas conhecidas: {hiper.marcas.join(", ")}.</p>
              <p className="mt-1 text-base text-suave">Preço estimado: {hiper.faixa_preco_brl}.</p>
            </div>
            <button onClick={() => setAberto("hipercalorico")} aria-label="Entender hipercalórico" className={BOTAO_AJUDA}>?</button>
          </div>
        </section>
      )}

      <p className="mt-6 max-w-[62ch] text-base text-suave">{MARCAS_REF}</p>
      <p className="mt-2 max-w-[62ch] text-base text-suave">{PRECOS_REF}</p>

      <Modal aberto={!!sup} titulo={sup?.nome ?? ""} onFechar={fechar}>
        {sup &&
          (
            [
              ["O que é?", sup.oQueE],
              ["Para que serve", sup.paraQueServe],
              ["O que a ciência diz", sup.ciencia],
              ["Como usar", sup.comoUsar],
              ["Cuidados", sup.alerta_uso],
              ["Marcas conhecidas", sup.marcas.join(", ")],
            ] as const
          ).map(([titulo, texto]) => (
            <div key={titulo} className="mt-4">
              <p className="text-lg font-semibold">{titulo}</p>
              <p className="text-lg text-suave">{texto}</p>
            </div>
          ))}
      </Modal>
    </div>
  );
}
