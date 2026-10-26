"use client";
import { CATEGORIAS, EXERCICIOS, categoriaDoExercicio, ehCardio } from "@/data/exercicios";
import type { Dia, ItemDia } from "@/components/DiasFicha";
import type { FichaTreinador } from "@/lib/equipe";

const INPUT = "mt-1 min-h-[3rem] w-full bg-fundo px-3 text-base";
const ROTULO = "block text-base font-semibold";
const BTN_ICONE =
  "min-h-[2.75rem] min-w-[2.75rem] btn-contorno text-lg font-bold disabled:opacity-30";
const BTN_TEXTO = "min-h-[3rem] font-bold underline underline-offset-4";
const DIAS_SEMANA = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
export const NOVO_ITEM: ItemDia = { id: "supino-reto", series: "3 × 10 a 12 repetições", descanso: "60 s", obs: "" };
const NOVO_CARDIO = { series: "20 min · ritmo moderado", descanso: "—" };

// Exercícios agrupados por categoria para o seletor.
const GRUPOS_SELECT = CATEGORIAS.filter((c) => c !== "Todos").map((c) => ({
  categoria: c,
  exercicios: EXERCICIOS.filter((e) => categoriaDoExercicio(e) === c),
}));

function mover<T>(lista: T[], de: number, para: number): T[] {
  if (para < 0 || para >= lista.length) return lista;
  const nova = [...lista];
  const [item] = nova.splice(de, 1);
  nova.splice(para, 0, item);
  return nova;
}

type Props = {
  ficha: FichaTreinador;
  onMudar: (f: FichaTreinador) => void;
  rotuloObs: string; // "Observações para o aluno" ou "Anotações"
  placeholderObs: string;
};

// Edição dos dias e exercícios de uma ficha (usada pelo treinador e pelo aluno na aba Criar).
export function EditorDias({ ficha, onMudar, rotuloObs, placeholderObs }: Props) {
  const alterarDia = (i: number, d: Partial<Dia>) => onMudar({ ...ficha, dias: ficha.dias.map((x, k) => (k === i ? { ...x, ...d } : x)) });
  const alterarItem = (i: number, n: number, it: Partial<ItemDia>) =>
    alterarDia(i, { itens: ficha.dias[i].itens.map((x, k) => (k === n ? { ...x, ...it } : x)) });

  // Ao trocar entre musculação e cardio, a prescrição muda de "séries" para "minutos" (e vice-versa).
  function trocarExercicio(i: number, n: number, id: string) {
    const atual = ficha.dias[i].itens[n];
    const eraCardio = ehCardio(atual.id), seraCardio = ehCardio(id);
    if (seraCardio && !eraCardio) alterarItem(i, n, { id, ...NOVO_CARDIO });
    else if (!seraCardio && eraCardio) alterarItem(i, n, { id, series: NOVO_ITEM.series, descanso: NOVO_ITEM.descanso });
    else alterarItem(i, n, { id });
  }

  function adicionarDia() {
    const usados = new Set(ficha.dias.map((d) => d.dia));
    const dia = DIAS_SEMANA.find((d) => !usados.has(d)) ?? `Dia ${ficha.dias.length + 1}`;
    onMudar({ ...ficha, dias: [...ficha.dias, { dia, titulo: "", itens: [{ ...NOVO_ITEM }] }] });
  }

  return (
    <div>
      <div className="grid max-w-3xl gap-5">
        <label className={ROTULO}>
          Nome da ficha
          <input value={ficha.titulo} onChange={(e) => onMudar({ ...ficha, titulo: e.target.value })} placeholder="Ex.: Hipertrofia · fase 1" className={`${INPUT} bg-superficie`} />
        </label>
        <label className={ROTULO}>
          {rotuloObs}
          <textarea
            value={ficha.observacoes}
            onChange={(e) => onMudar({ ...ficha, observacoes: e.target.value })}
            rows={3}
            placeholder={placeholderObs}
            className="mt-1 w-full bg-superficie p-3 text-base"
          />
        </label>
      </div>

      <div className="mt-8 grid gap-6">
        {ficha.dias.map((d, i) => (
          <section key={i} className="bg-superficie p-4 md:p-6" aria-label={`Dia ${i + 1}`}>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className={ROTULO}>
                Dia
                <input value={d.dia} onChange={(e) => alterarDia(i, { dia: e.target.value })} className={INPUT} />
              </label>
              <label className={ROTULO}>
                Treino
                <input value={d.titulo} onChange={(e) => alterarDia(i, { titulo: e.target.value })} placeholder="Ex.: Treino A · Peito e tríceps" className={INPUT} />
              </label>
              <div className="flex gap-2">
                <button onClick={() => onMudar({ ...ficha, dias: mover(ficha.dias, i, i - 1) })} disabled={i === 0} aria-label="Subir dia" className={BTN_ICONE}>↑</button>
                <button onClick={() => onMudar({ ...ficha, dias: mover(ficha.dias, i, i + 1) })} disabled={i === ficha.dias.length - 1} aria-label="Descer dia" className={BTN_ICONE}>↓</button>
                <button
                  onClick={() => window.confirm(`Remover ${d.dia || "este dia"}?`) && onMudar({ ...ficha, dias: ficha.dias.filter((_, k) => k !== i) })}
                  aria-label="Remover dia"
                  className={`${BTN_ICONE} hover:border-primario hover:text-alerta`}
                >
                  ✕
                </button>
              </div>
            </div>

            <ol className="mt-4 divide-y divide-linha border-y border-linha">
              {d.itens.map((it, n) => {
                const cardio = ehCardio(it.id);
                return (
                  <li key={n} className="grid gap-3 py-4 md:grid-cols-[2rem_minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_auto] md:items-end">
                    <span className="font-titulo text-3xl font-extrabold tabular-nums md:pb-2">{n + 1}</span>
                    <label className={ROTULO}>
                      Exercício
                      <select value={it.id} onChange={(e) => trocarExercicio(i, n, e.target.value)} className={INPUT}>
                        {GRUPOS_SELECT.map((g) => (
                          <optgroup key={g.categoria} label={g.categoria}>
                            {g.exercicios.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </label>
                    <label className={ROTULO}>
                      {cardio ? "Duração e ritmo" : "Séries e repetições"}
                      <input value={it.series} onChange={(e) => alterarItem(i, n, { series: e.target.value })} placeholder={cardio ? "20 min · ritmo moderado" : "3 × 10 repetições"} className={INPUT} />
                    </label>
                    <label className={ROTULO}>
                      Descanso
                      <input value={it.descanso} onChange={(e) => alterarItem(i, n, { descanso: e.target.value })} placeholder={cardio ? "—" : "60 s"} disabled={cardio} className={`${INPUT} disabled:opacity-40`} />
                    </label>
                    <div className="flex gap-2">
                      <button onClick={() => alterarDia(i, { itens: mover(d.itens, n, n - 1) })} disabled={n === 0} aria-label="Subir exercício" className={BTN_ICONE}>↑</button>
                      <button onClick={() => alterarDia(i, { itens: mover(d.itens, n, n + 1) })} disabled={n === d.itens.length - 1} aria-label="Descer exercício" className={BTN_ICONE}>↓</button>
                      <button onClick={() => alterarDia(i, { itens: d.itens.filter((_, k) => k !== n) })} aria-label="Remover exercício" className={`${BTN_ICONE} hover:border-primario hover:text-alerta`}>✕</button>
                    </div>
                    <label className={`${ROTULO} md:col-start-2 md:col-end-6`}>
                      Observação <span className="font-normal text-suave">(opcional)</span>
                      <input value={it.obs ?? ""} onChange={(e) => alterarItem(i, n, { obs: e.target.value })} placeholder="Ex.: descer em 3 segundos, carga de 20 kg" className={INPUT} />
                    </label>
                  </li>
                );
              })}
            </ol>
            <button onClick={() => alterarDia(i, { itens: [...d.itens, { ...NOVO_ITEM }] })} className={`${BTN_TEXTO} mt-3`}>+ Adicionar exercício</button>
          </section>
        ))}
      </div>

      <button onClick={adicionarDia} className={`${BTN_TEXTO} mt-6 text-lg`}>+ Adicionar dia</button>
    </div>
  );
}
